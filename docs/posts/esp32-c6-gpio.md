---
title: ESP32-C6 GPIO 速查
date: 2026-08-31
tags: [esp32, 硬件]
description: ESP32-C6 各 GPIO 的可用性速查, 标出被 flash 占用、模组未引出和带使用前提的引脚.
---

<script setup>
import { esp32c6 } from './data/esp32-c6'
</script>

# ESP32-C6 GPIO 速查

GPIO 编号 `0–30`，其中 `GPIO14` 只在内置 flash 的 QFN32 变体上存在，`GPIO24–30` 被 flash 占用——常用的 WROOM-1 模组（QFN40）实际引出 23 个，基本自由的 17 个（绿点），其余带前提。点击引脚看说明，用筛选按钮找可用脚。

<PinoutViewer :chip="esp32c6" />

## SPI 跑满 80MHz {#spi-80mhz}

和 [C3](/posts/esp32-c3-gpio/) 一样，SPI2 最高 80MHz 的前提是**走 IO_MUX 直连**：ESP-IDF 驱动只有在 bus 引脚（SCLK / MOSI / MISO 中实际用到的）全部落在 IO_MUX 位置时才走直连；任何一个不匹配，整条总线就静默改走 GPIO 矩阵，没有任何报错或日志。矩阵路径官方只保证 40MHz 及以下的行为与直连一致 [3]，而分频不看路由，配 80MHz 引脚上照样输出 80MHz——超规格带病跑，可能点得亮，也可能间歇花屏。

| 信号 | IO_MUX 引脚 |
| --- | :-: |
| SCLK (FSPICLK) | GPIO6 |
| MOSI (FSPID) | GPIO7 |
| MISO (FSPIQ) | GPIO2 |
| CS0 (FSPICS0) | GPIO16（默认串口 TX，别占） |

CS 不算 bus 引脚，走 GPIO 矩阵也不影响直连，而 C6 的 CS0 IO_MUX 位置 `GPIO16` 恰好是默认串口 TX——别为一个 CS 牺牲串口，随便挑个自由脚就行。注意 Arduino 核的默认 SPI 引脚（`SS=18 / MOSI=19 / MISO=20 / SCK=21` [6]）与 IO_MUX 位置不重合，走的是矩阵，只在 40MHz 内可靠——像 TFT_eSPI 这样自己指定引脚的库，按上表填即可。

**接线示例**（以 ST7789 屏为例，只写不读，MISO 不接）：

| SCLK | MOSI | CS | DC | RST | BLK |
| :-: | :-: | :-: | :-: | :-: | :-: |
| GPIO6 | GPIO7 | GPIO18 | GPIO10 | GPIO11 | GPIO3 |

::: code-group

```c [ESP-IDF]
// bus 引脚匹配 IO_MUX 后，驱动自动走直连
spi_bus_config_t buscfg = {
    .sclk_io_num = 6,
    .mosi_io_num = 7,
    .miso_io_num = -1,   // 只写不读
    .quadwp_io_num = -1,
    .quadhd_io_num = -1,
};
spi_device_interface_config_t devcfg = {
    .clock_speed_hz = SPI_MASTER_FREQ_80M,
    .spics_io_num = 18,
    // ...
};
```

```c [TFT_eSPI]
// User_Setup.h
#define TFT_SCLK 6
#define TFT_MOSI 7
#define TFT_CS   18
#define TFT_DC   10
#define TFT_RST  11
#define TFT_BL   3
#define TFT_BACKLIGHT_ON HIGH
#define SPI_FREQUENCY 80000000
```

:::

## 深睡与 LP 引脚 {#lp}

C6 比 C3 多了一个 LP（低功耗）核心：深度睡眠时主核断电，LP 核心还能继续跑——典型玩法是深睡中低功耗轮询传感器，有事再唤醒主核。但 LP 世界只有 `GPIO0–7`，且 LP 外设走 LP IO_MUX，引脚**固定、不可经 GPIO 矩阵改道** [7]：

| 功能 | 引脚 |
| --- | :-: |
| 深睡唤醒 | `0–7` 任意 |
| LP I2C | SDA=GPIO6 / SCL=GPIO7 |
| LP UART | RX=GPIO4 / TX=GPIO5 |

取舍点：LP I2C 的 `6 / 7` 正是 80MHz SPI 的 SCLK / MOSI，「深睡采传感器」和「高速刷屏」在引脚上互斥，规划时先定谁优先。这个约束只管 LP 世界——主核醒着时 I2C / UART 照常走 GPIO 矩阵，任意脚都行。

## 选引脚决策 {#decision}

1. 高速 SPI（屏幕 / 外部 flash）→ 固定 `6 / 7`，要读再加 `2`；CS 任意自由脚（IO_MUX 的 CS0 在 `16`，那是默认串口 TX，别占）
2. I2C / UART1 / PWM / WS2812 / TWAI(CAN) / I2S → 都走 GPIO 矩阵，**没有固定引脚**，任意自由脚都行
3. I2C 记得上拉。Arduino 核默认 `SDA=23` / `SCL=22` [6]——这两个脚本来就自由，不像 C3 还牵扯 strapping
4. ADC → `GPIO0–6`（ADC1 七个通道）；C6 没有 ADC2，也就没有 C3 那个 ADC2 硬件缺陷的坑
5. 深度睡眠唤醒 → `GPIO0–7`（LP 域），比 C3 多两个
6. 深睡期间跑 LP 核心 → 引脚固定且与 80MHz SPI 抢 `6 / 7`，见[深睡与 LP 引脚](#lp)
7. 上电敏感负载（继电器 / MOS 驱动）→ 避开 `8 / 9`（boot strapping）、`12 / 13`（USB）和 `16`（复位后输出 ROM 日志），首选 `3 / 10 / 11 / 18–23`
8. SDIO slave 从机 → 固定 `18–23`；不用 SDIO 时 `4 / 5` 的 strapping 电平无影响，放心用
9. 模组上 `GPIO24–30` 当作不存在（QFN40 裸片画板时它们接自己的 flash）；`GPIO14` 只有 QFN32 内置 flash 变体才有，QFN40 上本来就不存在

## 数据来源 {#sources}

核验于 2026-08-31。文中及引脚说明里的 `[n]` 编号对应以下来源：

1. [ESP32-C6 Datasheet — Strapping Pins（表 3-4 / 3-7）与封装引脚表](https://documentation.espressif.com/esp32-c6_datasheet_en.html)
2. [ESP-IDF — GPIO & RTC GPIO (ESP32-C6)](https://docs.espressif.com/projects/esp-idf/en/latest/esp32c6/api-reference/peripherals/gpio.html)
3. [ESP-IDF — SPI Master Driver (ESP32-C6)](https://docs.espressif.com/projects/esp-idf/en/latest/esp32c6/api-reference/peripherals/spi_master.html)
4. [esptool — Boot Mode Selection (ESP32-C6)](https://docs.espressif.com/projects/esptool/en/latest/esp32c6/advanced-topics/boot-mode-selection.html)
5. [ESP32-C6-DevKitC-1 User Guide](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c6/esp32-c6-devkitc-1/user_guide.html)
6. [arduino-esp32 — variants/esp32c6/pins_arduino.h](https://github.com/espressif/arduino-esp32/blob/master/variants/esp32c6/pins_arduino.h)
7. [ESP-IDF — ULP LP Core (ESP32-C6)：LP I2C / LP UART 固定引脚](https://docs.espressif.com/projects/esp-idf/en/latest/esp32c6/api-reference/system/ulp-lp-core.html)
