---
title: ESP32-C3 GPIO 速查
date: 2026-08-31
tags: [esp32, 硬件]
description: ESP32-C3 全部 22 个 GPIO 的可用性速查, 哪些完全自由, 哪些带前提, 点击引脚看说明.
---

<script setup>
import { esp32c3 } from './data/esp32-c3'
</script>

# ESP32-C3 GPIO 速查

共 22 个 GPIO（`0–21`），模组实际引出 15 个，其中完全自由的 8 个（绿点），其余带前提。点击引脚看说明，用筛选按钮找可用脚。

<PinoutViewer :chip="esp32c3" />

## SPI 跑满 80MHz {#spi-80mhz}

SPI2 最高能跑 80MHz，前提是**走 IO_MUX 直连**：ESP-IDF 驱动只有在 bus 引脚（SCLK / MOSI / MISO 中实际用到的）全部落在 IO_MUX 位置时才走直连；任何一个不匹配，整条总线就静默改走 GPIO 矩阵，没有任何报错或日志。矩阵路径官方只保证 40MHz 及以下的行为与直连一致 [3]，而分频不看路由，配 80MHz 引脚上照样输出 80MHz——超规格带病跑，可能点得亮，也可能间歇花屏。

| 信号 | IO_MUX 引脚 |
| --- | :-: |
| SCLK (FSPICLK) | GPIO6 |
| MOSI (FSPID) | GPIO7 |
| MISO (FSPIQ) | GPIO2 |
| CS0 (FSPICS0) | GPIO10 |

CS 不算 bus 引脚，走 GPIO 矩阵也不影响直连，但 `GPIO10` 空着就直接用。注意 Arduino 核的默认 SPI 引脚（`SCK=4 / MOSI=6 / MISO=5 / SS=7` [7]）与 IO_MUX 位置不重合，走的是矩阵，只在 40MHz 内可靠——像 TFT_eSPI 这样自己指定引脚的库，按上表填即可。

**接线示例**（以 ST7789 屏为例，只写不读，MISO 不接）：

| SCLK | MOSI | CS | DC | RST | BLK |
| :-: | :-: | :-: | :-: | :-: | :-: |
| GPIO6 | GPIO7 | GPIO10 | GPIO4 | GPIO5 | GPIO3 |

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
    .spics_io_num = 10,
    // ...
};
```

```c [TFT_eSPI]
// User_Setup.h
#define TFT_SCLK 6
#define TFT_MOSI 7
#define TFT_CS   10
#define TFT_DC   4
#define TFT_RST  5
#define TFT_BL   3
#define TFT_BACKLIGHT_ON HIGH
#define SPI_FREQUENCY 80000000
```

:::

## 选引脚决策 {#decision}

1. 高速 SPI（屏幕 / 外部 flash）→ 固定 `6 / 7`，要读再加 `2`；CS 不挑脚，`10` 空着就直接用
2. I2C / UART1 / PWM / WS2812 / CAN / I2S → 都走 GPIO 矩阵，**没有固定引脚**，任意自由脚都行
3. I2C 记得上拉。Arduino 核默认 `SDA=8` / `SCL=9` [7]——I2C 的上拉正好满足这两个 strapping 脚的要求，把它们让给 I2C 等于省出两个自由脚
4. ADC → 只用 `GPIO0–4`（ADC1）；`GPIO5` 的 ADC2 有硬件缺陷，官方已放弃支持
5. 深度睡眠唤醒 → 只有 `GPIO0–5`（RTC 域）
6. 上电敏感负载（继电器 / MOS 驱动）→ 避开 `2 / 8 / 9`（strapping）、`18 / 19`（USB）和 `21`（复位后输出 ROM 日志），首选 `3 / 4 / 5 / 6 / 7 / 10`
7. 模组上 `GPIO11–17` 当作不存在；裸片画板时 `12–17` 接自己的 flash，`11`（VDD_SPI）在 flash 由 3.3V 直供时还能当普通 GPIO 用 [8]

## 数据来源 {#sources}

核验于 2026-08-31。文中及引脚说明里的 `[n]` 编号对应以下来源：

1. [ESP32-C3 Datasheet — Strapping Pins（表 3-1 / 3-3 / 3-4）](https://documentation.espressif.com/esp32-c3_datasheet_en.html)
2. [ESP-IDF — GPIO & RTC GPIO (ESP32-C3)](https://docs.espressif.com/projects/esp-idf/en/latest/esp32c3/api-reference/peripherals/gpio.html)
3. [ESP-IDF — SPI Master Driver (ESP32-C3)](https://docs.espressif.com/projects/esp-idf/en/latest/esp32c3/api-reference/peripherals/spi_master.html)
4. [ESP-IDF — ADC Oneshot：ADC2 errata](https://docs.espressif.com/projects/esp-idf/en/latest/esp32c3/api-reference/peripherals/adc/adc_oneshot.html)
5. [esptool — Boot Mode Selection (ESP32-C3)](https://docs.espressif.com/projects/esptool/en/latest/esp32c3/advanced-topics/boot-mode-selection.html)
6. [ESP32-C3-DevKitM-1 User Guide](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c3/esp32-c3-devkitm-1/user_guide.html)
7. [arduino-esp32 — variants/esp32c3/pins_arduino.h](https://github.com/espressif/arduino-esp32/blob/master/variants/esp32c3/pins_arduino.h)
8. [ESP Hardware Design Guidelines — ESP32-C3 Schematic Checklist：VDD_SPI 作 GPIO 与 flash 走线](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/schematic-checklist.html)
