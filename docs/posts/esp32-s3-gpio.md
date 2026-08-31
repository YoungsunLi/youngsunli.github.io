---
title: ESP32-S3 GPIO 速查
date: 2026-08-31
---

<script setup>
import { esp32s3 } from './data/esp32-s3'
</script>

# ESP32-S3 GPIO 速查

GPIO 编号 `0–21`、`26–48` 共 45 个（`22–25` 不存在）。`26–32` 被 flash 占用，`33 / 34` 模组不引出——常用的 WROOM-1 模组实际引出 36 个；八线 PSRAM 变体（型号带 R8，下文细说）还要再扣掉 `35–37`，剩 33 个。基本自由的 26 个（绿点），其余带前提。点击引脚看说明，用筛选按钮找可用脚。

<PinoutViewer :chip="esp32s3" />

## SPI 跑满 80MHz {#spi-80mhz}

和 [C3](/posts/esp32-c3-gpio/)、[C6](/posts/esp32-c6-gpio/) 一样，SPI2 最高 80MHz 的前提是**走 IO_MUX 直连**：ESP-IDF 驱动只有在 bus 引脚（SCLK / MOSI / MISO 中实际用到的）全部落在 IO_MUX 位置时才走直连；任何一个不匹配，整条总线就静默改走 GPIO 矩阵，没有任何报错或日志。矩阵路径官方只保证 40MHz 及以下的行为与直连一致 [3]，而分频不看路由，配 80MHz 引脚上照样输出 80MHz——超规格带病跑，可能点得亮，也可能间歇花屏。

| 信号 | IO_MUX 引脚 |
| --- | :-: |
| SCLK (FSPICLK) | GPIO12 |
| MOSI (FSPID) | GPIO11 |
| MISO (FSPIQ) | GPIO13 |
| CS0 (FSPICS0) | GPIO10 |

S3 有个省心的地方：Arduino 核的默认 SPI 引脚（`SS=10 / MOSI=11 / MISO=13 / SCK=12` [6]）与 IO_MUX 位置**完全重合**——不像 C3 / C6 默认走矩阵，S3 上照默认引脚接线天生就是直连。CS 不算 bus 引脚，走 GPIO 矩阵也不影响直连，但 `10` 空着就直接用。

S3 还比 C3 / C6 多一条通用 **SPI3**，两条总线可以同时各挂各的设备。但 IO_MUX 直连位置只有 SPI2 这一组 [3]——SPI3 接哪都走 GPIO 矩阵，按 40MHz 及以下用。典型分工：SPI2 直连 80MHz 刷屏，SPI3 慢速挂别的 SPI 设备。

顺带一提，80MHz SPI 并不是 S3 刷屏的天花板——它还有 C3 / C6 没有的并口 LCD 外设（i80 / RGB），一个时钟送 8 或 16 位数据，引脚同样走 GPIO 矩阵任意选 [13]。真正的门槛是引脚预算：8-bit i80 要 11 个脚起步（8 数据 + WR / DC / CS），RGB565 屏则是 19 个起步（16 数据 + PCLK + HSYNC / VSYNC），一块屏就能吃掉大半自由脚。

**接线示例**（以 ST7789 屏为例，只写不读，MISO 不接）：

| SCLK | MOSI | CS | DC | RST | BLK |
| :-: | :-: | :-: | :-: | :-: | :-: |
| GPIO12 | GPIO11 | GPIO10 | GPIO4 | GPIO5 | GPIO6 |

::: code-group

```c [ESP-IDF]
// bus 引脚匹配 IO_MUX 后，驱动自动走直连
spi_bus_config_t buscfg = {
    .sclk_io_num = 12,
    .mosi_io_num = 11,
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
#define TFT_SCLK 12
#define TFT_MOSI 11
#define TFT_CS   10
#define TFT_DC   4
#define TFT_RST  5
#define TFT_BL   6
#define TFT_BACKLIGHT_ON HIGH
#define SPI_FREQUENCY 80000000
```

:::

## 八线 PSRAM 吃掉 GPIO35–37 {#octal}

S3 模组的型号后缀直接决定引脚数：`N` 后面是 flash 容量，`R` 后面是 PSRAM 容量，**R8 表示八线（Octal）PSRAM**——八线多出来的数据线 SPIIO4–7 和 SPIDQS 落在 `GPIO33–37` 上 [2]：`33 / 34` 模组本来就不引出 [8]，真正的代价是引出来的 `35 / 36 / 37` 也不能用了 [5]。全部 WROOM-2（八线 flash）同理。

| 模组 | GPIO35–37 |
| --- | :-: |
| WROOM-1 N8 / N16（无 PSRAM）、N8R2（四线 PSRAM） | ✅ 可用 |
| WROOM-1 N8R8 / N16R8（八线 PSRAM）、全部 WROOM-2 | ❌ 被占用 |

选型时看清后缀：市面上最常见的 DevKitC-1 大多配的是 N16R8，拿到手 `35–37` 就是不能碰——板上画了排针不等于能用，接上去轻则数据错乱，重则 PSRAM 直接挂掉。自己画板贴 R8 模组同理，这三个脚干脆别布线。直接用裸片（QFN56）画板的话，`26–32` 留给自己的 flash / PSRAM，`33 / 34` 在非八线配置下则是普通可用脚。

后缀还有个 `V` 要留意：代表 1.8V PSRAM（如 N16R16V），VDD_SPI 域电压跟着变 1.8V，而 `47 / 48` 恰好由这个域供电——电平变成 1.8V，直接接 3.3V 外设不可靠 [8]。

## 深睡与 ULP 引脚 {#ulp}

S3 带 ULP RISC-V 协处理器：深度睡眠时主核断电，ULP 还能低功耗轮询传感器，有事再唤醒主核。ULP 世界只有 RTC 域的 `GPIO0–21`，其中 RTC I2C（深睡期间 ULP 采 I2C 传感器用的那套）引脚**固定、不可经 GPIO 矩阵改道** [7]：

| 功能 | 引脚 |
| --- | :-: |
| 深睡唤醒（EXT0 / EXT1） | `0–21` 任意 [12] |
| 触摸唤醒 | `1–14`（T1–T14）[12] |
| ULP RTC I2C | SDA=GPIO1 或 3 / SCL=GPIO0 或 2 |

触摸能直接从深睡唤醒主核 [12]，做「摸一下才亮」的桌面小玩意不用占按键——C3 / C6 没有触摸，自然也没这个唤醒源。

比 C6 幸运的是：C6 的 LP I2C 钉死在 `6 / 7`，恰好撞上 80MHz SPI 的 SCLK / MOSI；而 S3 的 RTC I2C 只占 `0–3`，与 80MHz SPI 的 `11 / 12 / 13` 互不冲突，「深睡采传感器」和「高速刷屏」可以共存，不用取舍。SCL 优先选 `2`（`0` 是 strapping 兼 BOOT 键），SDA 选 `1` 或 `3` 都行。

## 选引脚决策 {#decision}

1. 高速 SPI（屏幕 / 外部 flash）→ 固定 `12 / 11`，要读再加 `13`；CS 用空着的 `10`。Arduino 默认 SPI 恰好就是这一组，照默认接即可
2. I2C / UART1 / PWM / WS2812 / TWAI(CAN) / I2S / 并口 LCD / 摄像头 / SD 卡（SDMMC，1/4/8 线）[11] → 都走 GPIO 矩阵，**没有固定引脚**，任意自由脚都行——不像 C6 的 SDIO 钉死在 `18–23`
3. USB host / 自定义 USB 设备（U 盘 / 键盘 / MSC……）→ 固定 `19 / 20`，S3 独有的 USB OTG [1]；与 USB Serial/JTAG 共用这对脚，启用 OTG 后烧录调试改走串口
4. I2C 记得上拉。Arduino 核默认 `SDA=8` / `SCL=9` [6]——这两个脚本来就自由，不像 C3 还牵扯 strapping
5. ADC → 优先 `GPIO1–10`（ADC1）；`GPIO11–20` 的 ADC2 与 Wi-Fi 共用，Wi-Fi 忙时读取会失败 [9]
6. 电容触摸 → `GPIO1–14`（T1–T14）[6]，还可作深睡唤醒源 [12]
7. 深度睡眠唤醒 → `GPIO0–21`（RTC 域）[12]，多到不用抢
8. 深睡期间跑 ULP 采 I2C → SDA=`1/3`、SCL=`0/2`，与高速 SPI 不冲突，见[深睡与 ULP 引脚](#ulp)
9. 上电敏感负载（继电器 / MOS 驱动）→ 避开 `0 / 45 / 46`（strapping，`45` 被拉高更是直接起不来）、`19 / 20`（USB）和 `43`（复位后输出 ROM 日志），首选 `4–7 / 21 / 38–42`
10. 八线 PSRAM 模组（R8 / WROOM-2）→ `35–37` 当作不存在；`22–25` 芯片就没有，模组上 `26–34` 也当作不存在（裸片画板时非八线配置的 `33 / 34` 可用）；V 后缀（1.8V PSRAM）连 `47 / 48` 都变 1.8V 电平

## 数据来源 {#sources}

核验于 2026-08-31。文中及引脚说明里的 `[n]` 编号对应以下来源：

1. [ESP32-S3 Datasheet — Boot Configurations 与封装引脚表](https://documentation.espressif.com/esp32-s3_datasheet_en.html)
2. [ESP-IDF — GPIO & RTC GPIO (ESP32-S3)](https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/api-reference/peripherals/gpio.html)
3. [ESP-IDF — SPI Master Driver (ESP32-S3)](https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/api-reference/peripherals/spi_master.html)
4. [esptool — Boot Mode Selection (ESP32-S3)](https://docs.espressif.com/projects/esptool/en/latest/esp32s3/advanced-topics/boot-mode-selection.html)
5. [ESP32-S3-DevKitC-1 User Guide v1.1](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide_v1.1.html)
6. [arduino-esp32 — variants/esp32s3/pins_arduino.h](https://github.com/espressif/arduino-esp32/blob/master/variants/esp32s3/pins_arduino.h)
7. [ESP-IDF — ULP RISC-V Coprocessor (ESP32-S3)：RTC I2C 固定引脚](https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/api-reference/system/ulp-risc-v.html)
8. [ESP32-S3-WROOM-1/1U Datasheet：模组引出引脚](https://documentation.espressif.com/esp32-s3-wroom-1_wroom-1u_datasheet_en.html)
9. [ESP-IDF — ADC Oneshot (ESP32-S3)：ADC2 与 Wi-Fi 共用](https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/api-reference/peripherals/adc/adc_oneshot.html)
10. [ESP Hardware Design Guidelines — ESP32-S3 Schematic Checklist：strapping 默认电平与 VDD_SPI](https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/schematic-checklist.html)
11. [ESP-IDF — SDMMC Host (ESP32-S3)：任意 GPIO、1/4/8 线](https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/api-reference/peripherals/sdmmc_host.html)
12. [ESP-IDF — Sleep Modes (ESP32-S3)：唤醒源与 RTC GPIO 范围](https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/api-reference/system/sleep_modes.html)
13. [ESP-IDF — LCD (ESP32-S3)：i80 / RGB 并口引脚经 GPIO 矩阵任意路由](https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/api-reference/peripherals/lcd/index.html)
