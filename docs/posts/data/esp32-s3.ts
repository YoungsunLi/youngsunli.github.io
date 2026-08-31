import type { ChipPinout } from '../../.vitepress/theme/pinout/types'

/**
 * ESP32-S3 引脚数据。核验于 2026-08-31，出处：
 *
 * [1] ESP32-S3 Datasheet §Boot Configurations（启动模式 / VDD_SPI / ROM 日志 / JTAG 信号源）与封装引脚表
 *     https://documentation.espressif.com/esp32-s3_datasheet_en.html
 * [2] ESP-IDF · GPIO & RTC GPIO (ESP32-S3)
 *     https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/api-reference/peripherals/gpio.html
 * [3] ESP-IDF · SPI Master Driver (ESP32-S3)，IO_MUX 引脚表与 GPIO 矩阵频率说明
 *     https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/api-reference/peripherals/spi_master.html
 * [4] esptool · Boot Mode Selection (ESP32-S3)
 *     https://docs.espressif.com/projects/esptool/en/latest/esp32s3/advanced-topics/boot-mode-selection.html
 * [5] ESP32-S3-DevKitC-1 User Guide v1.1（板载 RGB 灯、UART0 引脚、八线 PSRAM 引脚占用）
 *     https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide_v1.1.html
 * [6] arduino-esp32 · variants/esp32s3/pins_arduino.h（Arduino 默认引脚、触摸 T1–T14）
 *     https://github.com/espressif/arduino-esp32/blob/master/variants/esp32s3/pins_arduino.h
 * [7] ESP-IDF · ULP RISC-V Coprocessor (ESP32-S3)，RTC I2C 固定引脚
 *     https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/api-reference/system/ulp-risc-v.html
 * [8] ESP32-S3-WROOM-1/1U Datasheet（模组引出引脚、1.8V 电压域变体）
 *     https://documentation.espressif.com/esp32-s3-wroom-1_wroom-1u_datasheet_en.html
 * [9] ESP-IDF · ADC Oneshot (ESP32-S3)，ADC2 与 Wi-Fi 共用
 *     https://docs.espressif.com/projects/esp-idf/en/latest/esp32s3/api-reference/peripherals/adc/adc_oneshot.html
 * [10] ESP Hardware Design Guidelines · ESP32-S3 Schematic Checklist（strapping 默认电平、VDD_SPI 选择）
 *     https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32s3/schematic-checklist.html
 */
export const esp32s3: ChipPinout = {
  name: 'ESP32-S3',
  subtitle: '双核 LX7 · QFN56',
  filters: [
    { key: 'spi80', label: '⚡ 80MHz SPI' },
    { key: 'free', label: '✅ 自由引脚' },
    { key: 'adc', label: 'ADC' },
    { key: 'touch', label: '👆 触摸' },
    { key: 'sleep', label: '💤 深睡唤醒' },
    { key: 'strap', label: 'Strapping' }
  ],
  pins: [
    {
      gpio: 0,
      availability: 'caution',
      tags: [
        { label: 'Strap ↑', kind: 'strap' },
        { label: 'BOOT 键', kind: 'misc' }
      ],
      cats: ['sleep', 'strap'],
      note: 'Strapping：决定启动模式，内部弱上拉 [1][10]；上电拉低（同时 GPIO46 为低/浮空）即进下载模式 [4]，就是板上的 BOOT 键。适合做低电平有效的按键输入，别接会在复位时拉低它的负载。RTC 域，可深睡唤醒 [2]；也是 ULP RTC I2C 的 SCL 可选脚（0/2 二选一）[7]。'
    },
    {
      gpio: 1,
      availability: 'free',
      tags: [
        { label: 'ADC1_CH0', kind: 'adc' },
        { label: 'T1', kind: 'adc' }
      ],
      cats: ['adc', 'touch', 'sleep', 'free'],
      note: 'RTC 域引脚，可做深度睡眠唤醒 [2]；触摸 T1 [6]。ULP RTC I2C 的 SDA 可选脚（1/3 二选一）[7]。无上电限制，可放心用。'
    },
    {
      gpio: 2,
      availability: 'free',
      tags: [
        { label: 'ADC1_CH1', kind: 'adc' },
        { label: 'T2', kind: 'adc' }
      ],
      cats: ['adc', 'touch', 'sleep', 'free'],
      note: 'RTC 域引脚，可深睡唤醒 [2]；触摸 T2 [6]。ULP RTC I2C 的 SCL 可选脚（0/2 二选一）——另一个可选脚 GPIO0 是 strapping 脚，深睡采 I2C 传感器优先用本脚当 SCL [7]。无上电限制。'
    },
    {
      gpio: 3,
      availability: 'free',
      tags: [
        { label: 'ADC1_CH2', kind: 'adc' },
        { label: 'T3', kind: 'adc' },
        { label: 'Strap', kind: 'strap' }
      ],
      cats: ['adc', 'touch', 'sleep', 'strap', 'free'],
      note: 'Strapping：JTAG 信号源选择，但只有烧写 JTAG_SEL_ENABLE eFuse 后才被采样，默认（eFuse 全 0）被忽略、JTAG 走 USB-JTAG [1]，当普通脚用没问题。烧了该 eFuse 的板子须外部给出确定电平（此脚无内部上下拉）[1]。触摸 T3 [6]；ULP RTC I2C 的 SDA 可选脚 [7]。RTC 域，可深睡唤醒。'
    },
    {
      gpio: 4,
      availability: 'free',
      tags: [
        { label: 'ADC1_CH3', kind: 'adc' },
        { label: 'T4', kind: 'adc' }
      ],
      cats: ['adc', 'touch', 'sleep', 'free'],
      note: '完全自由的引脚，适合 DC / RST / 背光 / 按键等杂活。触摸 T4 [6]。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 5,
      availability: 'free',
      tags: [
        { label: 'ADC1_CH4', kind: 'adc' },
        { label: 'T5', kind: 'adc' }
      ],
      cats: ['adc', 'touch', 'sleep', 'free'],
      note: '完全自由的引脚。触摸 T5 [6]。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 6,
      availability: 'free',
      tags: [
        { label: 'ADC1_CH5', kind: 'adc' },
        { label: 'T6', kind: 'adc' }
      ],
      cats: ['adc', 'touch', 'sleep', 'free'],
      note: '完全自由的引脚。触摸 T6 [6]。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 7,
      availability: 'free',
      tags: [
        { label: 'ADC1_CH6', kind: 'adc' },
        { label: 'T7', kind: 'adc' }
      ],
      cats: ['adc', 'touch', 'sleep', 'free'],
      note: '完全自由的引脚。触摸 T7 [6]。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 8,
      availability: 'free',
      tags: [
        { label: 'ADC1_CH7', kind: 'adc' },
        { label: 'T8', kind: 'adc' }
      ],
      cats: ['adc', 'touch', 'sleep', 'free'],
      note: 'Arduino 默认 I2C 的 SDA 在此脚 [6]，记得上拉。触摸 T8。RTC 域，可深睡唤醒 [2]。与 C3 不同，S3 的它不是 strapping 脚，无上电顾虑。'
    },
    {
      gpio: 9,
      availability: 'free',
      tags: [
        { label: 'FSPIHD', kind: 'spi' },
        { label: 'ADC1_CH8', kind: 'adc' },
        { label: 'T9', kind: 'adc' }
      ],
      cats: ['adc', 'touch', 'sleep', 'free'],
      note: 'Arduino 默认 I2C 的 SCL 在此脚 [6]，记得上拉。FSPIHD 仅四线 QSPI 用到 [3]。触摸 T9。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 10,
      availability: 'free',
      tags: [
        { label: 'FSPICS0', kind: 'spi' },
        { label: 'ADC1_CH9', kind: 'adc' },
        { label: 'T10', kind: 'adc' }
      ],
      cats: ['spi80', 'adc', 'touch', 'sleep', 'free'],
      note: 'SPI2 CS0 的 IO_MUX 位置 [3]——CS 不算 bus 引脚、本不挑脚，但它空着就直接用；Arduino 默认 SPI 的 SS 也在此脚 [6]。触摸 T10。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 11,
      availability: 'free',
      tags: [
        { label: 'FSPID=MOSI', kind: 'spi' },
        { label: '80M', kind: 'hot' },
        { label: 'ADC2_CH0', kind: 'adc' },
        { label: 'T11', kind: 'adc' }
      ],
      cats: ['spi80', 'adc', 'touch', 'sleep', 'free'],
      note: 'SPI2 MOSI 的 IO_MUX 位置——超过 40MHz 时 MOSI 只能是它 [3]。Arduino 默认 SPI 的 MOSI 恰好就是它 [6]，S3 上默认引脚天生走直连。ADC2 与 Wi-Fi 共用，采样优先挑 ADC1 的脚 [9]。触摸 T11。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 12,
      availability: 'free',
      tags: [
        { label: 'FSPICLK=SCLK', kind: 'spi' },
        { label: '80M', kind: 'hot' },
        { label: 'ADC2_CH1', kind: 'adc' },
        { label: 'T12', kind: 'adc' }
      ],
      cats: ['spi80', 'adc', 'touch', 'sleep', 'free'],
      note: 'SPI2 时钟的 IO_MUX 位置——要超过 40MHz，SCLK 只能是它，否则整条总线走 GPIO 矩阵，只在 40MHz 内可靠 [3]。Arduino 默认 SPI 的 SCK 恰好就是它 [6]。触摸 T12。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 13,
      availability: 'free',
      tags: [
        { label: 'FSPIQ=MISO', kind: 'spi' },
        { label: '80M', kind: 'hot' },
        { label: 'ADC2_CH2', kind: 'adc' },
        { label: 'T13', kind: 'adc' }
      ],
      cats: ['spi80', 'adc', 'touch', 'sleep', 'free'],
      note: 'SPI2 唯一的 IO_MUX MISO——80MHz 全双工读必须用它 [3]。Arduino 默认 SPI 的 MISO 恰好就是它 [6]。触摸 T13。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 14,
      availability: 'free',
      tags: [
        { label: 'FSPIWP', kind: 'spi' },
        { label: 'ADC2_CH3', kind: 'adc' },
        { label: 'T14', kind: 'adc' }
      ],
      cats: ['adc', 'touch', 'sleep', 'free'],
      note: '自由脚。FSPIWP 仅四线 QSPI 用到 [3]。触摸 T14（S3 的触摸到此为止）[6]。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 15,
      availability: 'free',
      tags: [{ label: 'ADC2_CH4', kind: 'adc' }],
      cats: ['adc', 'sleep', 'free'],
      note: '自由脚。复用 XTAL_32K_P（外接 32K 晶振时占用）[1]。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 16,
      availability: 'free',
      tags: [{ label: 'ADC2_CH5', kind: 'adc' }],
      cats: ['adc', 'sleep', 'free'],
      note: '自由脚。复用 XTAL_32K_N [1]。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 17,
      availability: 'free',
      tags: [{ label: 'ADC2_CH6', kind: 'adc' }],
      cats: ['adc', 'sleep', 'free'],
      note: '自由脚。复用 U1TXD（UART1 的 IO_MUX 位置，UART 走矩阵不挑脚，用不用随意）[1]。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 18,
      availability: 'free',
      tags: [{ label: 'ADC2_CH7', kind: 'adc' }],
      cats: ['adc', 'sleep', 'free'],
      note: '自由脚。复用 U1RXD [1]。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 19,
      availability: 'caution',
      tags: [
        { label: 'ADC2_CH8', kind: 'adc' },
        { label: 'USB D−', kind: 'usb' }
      ],
      cats: ['adc', 'sleep'],
      note: 'USB D−，USB Serial/JTAG 与 USB OTG 共用这对脚 [1][2]；改作 GPIO 即失去 USB 烧录与调试 [2]。上电有 USB 枚举活动，别接毛刺敏感的负载。RTC 域，可深睡唤醒。'
    },
    {
      gpio: 20,
      availability: 'caution',
      tags: [
        { label: 'ADC2_CH9', kind: 'adc' },
        { label: 'USB D+', kind: 'usb' }
      ],
      cats: ['adc', 'sleep'],
      note: 'USB D+，USB 功能激活时有内部上拉；改作 GPIO 即失去 USB 烧录与调试 [2]。RTC 域，可深睡唤醒。'
    },
    {
      gpio: 21,
      availability: 'free',
      tags: [],
      cats: ['sleep', 'free'],
      note: '无任何复用的纯自由脚。RTC 域最后一个脚，可深睡唤醒 [2]——GPIO26 往后的脚都不能。'
    },
    {
      gpio: 22,
      label: 'GPIO22–25',
      availability: 'avoid',
      tags: [{ label: '不存在', kind: 'misc' }],
      cats: [],
      note: 'ESP32-S3 没有这四个编号 [1][2]，写代码时当它们不存在。'
    },
    {
      gpio: 26,
      label: 'GPIO26–32',
      availability: 'avoid',
      tags: [{ label: 'flash 占用', kind: 'flash' }],
      cats: [],
      note: '接模组 flash / PSRAM：SPICS1=26、SPIHD=27、SPIWP=28、SPICS0=29、SPICLK=30、SPIQ=31、SPID=32 [1]，官方明确不建议挪作他用 [2]。WROOM-1 模组不引出这 7 个脚 [8]；裸片画板同理，这组脚留给自己的 flash / PSRAM。'
    },
    {
      gpio: 33,
      label: 'GPIO33–34',
      availability: 'caution',
      tags: [{ label: '模组不引出', kind: 'misc' }],
      cats: [],
      note: 'WROOM-1 模组没有引出这两个脚 [8]，用模组时当它们不存在。直接用裸片（QFN56）画板时它们是普通 GPIO，只有八线 flash/PSRAM 配置把它们用作 SPIIO4/SPIIO5 [2]。'
    },
    {
      gpio: 35,
      label: 'GPIO35–37',
      availability: 'caution',
      tags: [{ label: '八线 PSRAM 占用', kind: 'flash' }],
      cats: [],
      note: '八线 flash/PSRAM 变体（型号带 R8 的 WROOM-1，以及全部 WROOM-2）把它们用作 SPIIO6 / SPIIO7 / SPIDQS，对外不可用 [2][5]；四线 PSRAM（R2）或无 PSRAM 变体上是普通自由脚。选模组时看清后缀，见文中「八线 PSRAM」一节。'
    },
    {
      gpio: 38,
      availability: 'free',
      tags: [{ label: '板载 WS2812', kind: 'misc' }],
      cats: ['free'],
      note: '自由脚。DevKitC-1 v1.1 的 WS2812 RGB 灯接在此脚（初版接 GPIO48）[5]。'
    },
    {
      gpio: 39,
      availability: 'free',
      tags: [],
      cats: ['free'],
      note: '自由脚。硬件 JTAG 的 MTCK——默认 JTAG 走 USB-JTAG，39–42 这组脚平时空闲，只有烧 eFuse 切到引脚 JTAG 后才被占用 [1][2]。'
    },
    {
      gpio: 40,
      availability: 'free',
      tags: [],
      cats: ['free'],
      note: '自由脚。硬件 JTAG 的 MTDO，默认空闲（JTAG 走 USB）[1][2]。'
    },
    {
      gpio: 41,
      availability: 'free',
      tags: [],
      cats: ['free'],
      note: '自由脚。硬件 JTAG 的 MTDI，默认空闲（JTAG 走 USB）[1][2]。'
    },
    {
      gpio: 42,
      availability: 'free',
      tags: [],
      cats: ['free'],
      note: '自由脚。硬件 JTAG 的 MTMS，默认空闲（JTAG 走 USB）[1][2]。'
    },
    {
      gpio: 43,
      availability: 'caution',
      tags: [{ label: 'U0TXD', kind: 'uart' }],
      cats: [],
      note: 'UART0 默认 TX [5][6]，串口日志输出，占用后看不到串口 log（还有 USB 口可救）；复位后它会输出 ROM 启动日志，引脚翻转，别接上电敏感负载 [4]。'
    },
    {
      gpio: 44,
      availability: 'caution',
      tags: [{ label: 'U0RXD', kind: 'uart' }],
      cats: [],
      note: 'UART0 默认 RX [5][6]，串口烧录 / 日志通道。占用后串口方式不可用（还有 USB 口可救）。'
    },
    {
      gpio: 45,
      availability: 'caution',
      tags: [{ label: 'Strap ↓', kind: 'strap' }],
      cats: ['strap'],
      note: 'Strapping：复位时的电平决定 VDD_SPI（flash / PSRAM 供电）电压——低=3.3V、高=1.8V，内部弱下拉默认 3.3V [1][10]。3.3V flash 的模组上复位时被拉高会直接起不来，绝对别接会在复位时拉高它的负载；启动后可当普通脚，但每次复位都要保证电平正确。'
    },
    {
      gpio: 46,
      availability: 'caution',
      tags: [{ label: 'Strap ↓', kind: 'strap' }],
      cats: ['strap'],
      note: 'Strapping：内部弱下拉 [1][10]。正常 SPI Boot（GPIO0 为高）时电平任意 [10]；进下载模式（GPIO0 拉低）时它必须为低/浮空，为高进不去 [4]。还与 eFuse UART_PRINT_CONTROL 组合控制 ROM 启动日志（出厂 eFuse 为 0 时打印不受它影响）[1]。别接会在复位时拉高它的负载。'
    },
    {
      gpio: 47,
      availability: 'free',
      tags: [],
      cats: ['free'],
      note: '自由脚。复用八线 flash 的差分时钟 SPICLK_P，常规模组用不到 [1]。注意 N16R16V（1.8V PSRAM）变体上 47/48 处于 1.8V 电压域 [8]。'
    },
    {
      gpio: 48,
      availability: 'free',
      tags: [{ label: '板载 WS2812', kind: 'misc' }],
      cats: ['free'],
      note: '自由脚。DevKitC-1 初版的 WS2812 RGB 灯接在此脚（v1.1 挪到 GPIO38）[5]，Arduino 的 RGB_BUILTIN 也指向它 [6]。复用 SPICLK_N；N16R16V 变体上处于 1.8V 域 [8]。'
    }
  ]
}
