import type { ChipPinout } from '../../.vitepress/theme/pinout/types'

/**
 * ESP32-C6 引脚数据。核验于 2026-08-31，出处：
 *
 * [1] ESP32-C6 Datasheet §Strapping Pins（表 3-4 SDIO 时序 / 表 3-7 JTAG 选择）与封装引脚表
 *     https://documentation.espressif.com/esp32-c6_datasheet_en.html
 * [2] ESP-IDF · GPIO & RTC GPIO (ESP32-C6)
 *     https://docs.espressif.com/projects/esp-idf/en/latest/esp32c6/api-reference/peripherals/gpio.html
 * [3] ESP-IDF · SPI Master Driver (ESP32-C6)，IO_MUX 引脚表与 GPIO 矩阵频率说明
 *     https://docs.espressif.com/projects/esp-idf/en/latest/esp32c6/api-reference/peripherals/spi_master.html
 * [4] esptool · Boot Mode Selection (ESP32-C6)
 *     https://docs.espressif.com/projects/esptool/en/latest/esp32c6/advanced-topics/boot-mode-selection.html
 * [5] ESP32-C6-DevKitC-1 User Guide（板载 RGB 灯、UART0 引脚、排针引出）
 *     https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c6/esp32-c6-devkitc-1/user_guide.html
 * [6] arduino-esp32 · variants/esp32c6/pins_arduino.h（Arduino 默认引脚）
 *     https://github.com/espressif/arduino-esp32/blob/master/variants/esp32c6/pins_arduino.h
 * [7] ESP-IDF · ULP LP Core (ESP32-C6)，LP I2C / LP UART 固定引脚
 *     https://docs.espressif.com/projects/esp-idf/en/latest/esp32c6/api-reference/system/ulp-lp-core.html
 */
export const esp32c6: ChipPinout = {
  name: 'ESP32-C6',
  subtitle: 'RISC-V · QFN40',
  filters: [
    { key: 'spi80', label: '⚡ 80MHz SPI' },
    { key: 'free', label: '✅ 自由引脚' },
    { key: 'adc', label: 'ADC' },
    { key: 'sleep', label: '💤 深睡唤醒' },
    { key: 'strap', label: 'Strapping' }
  ],
  pins: [
    {
      gpio: 0,
      availability: 'free',
      tags: [{ label: 'ADC1_CH0', kind: 'adc' }],
      cats: ['adc', 'sleep', 'free'],
      note: 'LP（RTC）域引脚，可做深度睡眠唤醒 [2]；复用 XTAL_32K_P（外接 32K 晶振时占用）[1]。无上电限制，可放心用。'
    },
    {
      gpio: 1,
      availability: 'free',
      tags: [{ label: 'ADC1_CH1', kind: 'adc' }],
      cats: ['adc', 'sleep', 'free'],
      note: 'LP 域引脚，可做深度睡眠唤醒 [2]；复用 XTAL_32K_N [1]。无上电限制，可放心用。'
    },
    {
      gpio: 2,
      availability: 'free',
      tags: [
        { label: 'FSPIQ=MISO', kind: 'spi' },
        { label: '80M', kind: 'hot' },
        { label: 'ADC1_CH2', kind: 'adc' }
      ],
      cats: ['spi80', 'adc', 'sleep', 'free'],
      note: 'SPI2 唯一的 IO_MUX MISO——80MHz 全双工读必须用它 [3]。与 C3 不同，C6 的它不是 strapping 脚，无上电顾虑。LP 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 3,
      availability: 'free',
      tags: [{ label: 'ADC1_CH3', kind: 'adc' }],
      cats: ['adc', 'sleep', 'free'],
      note: '完全自由的引脚，适合 DC / RST / 背光 / 按键等杂活。LP 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 4,
      availability: 'free',
      tags: [
        { label: 'FSPIHD', kind: 'spi' },
        { label: 'ADC1_CH4', kind: 'adc' },
        { label: 'Strap', kind: 'strap' }
      ],
      cats: ['adc', 'sleep', 'strap', 'free'],
      note: 'Strapping（MTMS）：上电电平只决定 SDIO slave 的采样/驱动时钟沿（表 3-4 [1]），不用 SDIO 就毫无影响，默认浮空即可，不影响启动。LP UART 的固定 RX——深睡期间 LP 核心要收串口只能用它 [7]。FSPIHD 仅四线 QSPI 用到 [3]；硬件 JTAG 的 MTMS（默认走 USB-JTAG，通常空闲）。LP 域，可深睡唤醒。'
    },
    {
      gpio: 5,
      availability: 'free',
      tags: [
        { label: 'FSPIWP', kind: 'spi' },
        { label: 'ADC1_CH5', kind: 'adc' },
        { label: 'Strap', kind: 'strap' }
      ],
      cats: ['adc', 'sleep', 'strap', 'free'],
      note: 'Strapping（MTDI）：与 GPIO4 一样只影响 SDIO 时钟沿 [1]，不用 SDIO 就无所谓。LP UART 的固定 TX——深睡期间 LP 核心要发串口只能用它 [7]。FSPIWP 仅四线 QSPI 用到；硬件 JTAG 的 MTDI。LP 域，可深睡唤醒。'
    },
    {
      gpio: 6,
      availability: 'free',
      tags: [
        { label: 'FSPICLK=SCLK', kind: 'spi' },
        { label: '80M', kind: 'hot' },
        { label: 'ADC1_CH6', kind: 'adc' }
      ],
      cats: ['spi80', 'adc', 'sleep', 'free'],
      note: 'SPI2 时钟的 IO_MUX 位置——要超过 40MHz，SCLK 只能是它，否则整条总线走 GPIO 矩阵，只在 40MHz 内可靠 [3]。也是 LP I2C 的固定 SDA：深睡期间 LP 核心采 I2C 传感器只能用 6/7 [7]，与 80MHz SPI 互斥，规划时先取舍（主核醒着时 I2C 走矩阵任意脚，无此冲突）。硬件 JTAG 的 MTCK。LP 域，可深睡唤醒。'
    },
    {
      gpio: 7,
      availability: 'free',
      tags: [
        { label: 'FSPID=MOSI', kind: 'spi' },
        { label: '80M', kind: 'hot' }
      ],
      cats: ['spi80', 'sleep', 'free'],
      note: 'SPI2 MOSI 的 IO_MUX 位置——超过 40MHz 时 MOSI 只能是它 [3]。也是 LP I2C 的固定 SCL，深睡 LP 采传感器与 80MHz SPI 在 6/7 上互斥 [7]。硬件 JTAG 的 MTDO。LP 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 8,
      availability: 'caution',
      tags: [
        { label: 'Strap ↑', kind: 'strap' },
        { label: '板载 WS2812', kind: 'misc' }
      ],
      cats: ['strap'],
      note: 'Strapping：正常 SPI Boot 时电平任意，仅进下载模式时要求为 1，与 GPIO9 同时为 0 是非法组合 [1][4]；还控制 ROM 启动日志是否打印 [1]。默认浮空，板上通常已上拉。别接会在复位时拉低它的负载。DevKitC-1 在此脚接了 WS2812 RGB 灯 [5]，Arduino 的 RGB_BUILTIN 也指向它 [6]。'
    },
    {
      gpio: 9,
      availability: 'caution',
      tags: [
        { label: 'Strap', kind: 'strap' },
        { label: 'BOOT 键', kind: 'misc' }
      ],
      cats: ['strap'],
      note: 'Strapping：内部弱上拉（约 45k）[1][4]；上电拉低即进下载模式，就是板上的 BOOT 键。适合做低电平有效的按键输入，别接会在复位时拉低它的负载。'
    },
    {
      gpio: 10,
      availability: 'free',
      tags: [],
      cats: ['free'],
      note: '无任何复用的纯自由脚。QFN32 内置 flash 变体不引出此脚 [1]，WROOM-1 模组（QFN40）正常引出。'
    },
    {
      gpio: 11,
      availability: 'free',
      tags: [],
      cats: ['free'],
      note: '无任何复用的纯自由脚。QFN32 内置 flash 变体不引出此脚 [1]，WROOM-1 模组（QFN40）正常引出。'
    },
    {
      gpio: 12,
      availability: 'caution',
      tags: [{ label: 'USB D−', kind: 'usb' }],
      cats: [],
      note: 'USB Serial/JTAG 的 D−，改作 GPIO 即失去 USB 烧录与调试 [2]；上电有 USB 枚举活动，别接毛刺敏感的负载。'
    },
    {
      gpio: 13,
      availability: 'caution',
      tags: [{ label: 'USB D+', kind: 'usb' }],
      cats: [],
      note: 'USB Serial/JTAG 的 D+，USB 功能激活时有内部上拉；改作 GPIO 即失去 USB 烧录与调试 [2]。'
    },
    {
      gpio: 14,
      availability: 'avoid',
      tags: [{ label: '仅 QFN32', kind: 'misc' }],
      cats: [],
      note: 'QFN40 封装（WROOM-1 模组用的就是它）没有这个脚——GPIO14 只存在于 QFN32 内置 flash 变体 [1]。用 WROOM-1 或 QFN40 裸片画板就当它不存在；选 QFN32 变体画板时它是普通引脚。'
    },
    {
      gpio: 15,
      availability: 'free',
      tags: [{ label: 'Strap', kind: 'strap' }],
      cats: ['strap', 'free'],
      note: 'Strapping：JTAG 信号源选择，但只有烧写 EFUSE_JTAG_SEL_ENABLE 后才被采样，默认（eFuse 全 0）被忽略、JTAG 走 USB-JTAG（表 3-7 [1]），当普通脚用没问题。烧了该 eFuse 的板子须外部给出确定电平（此脚无内部上下拉）[1]。'
    },
    {
      gpio: 16,
      availability: 'caution',
      tags: [
        { label: 'FSPICS0', kind: 'spi' },
        { label: 'U0TXD', kind: 'uart' }
      ],
      cats: ['spi80'],
      note: 'UART0 默认 TX [5][6]，串口日志输出，占用后看不到串口 log（还有 USB 口可救）；复位后它会输出 ROM 启动日志，引脚翻转，别接上电敏感负载 [4]。它同时是 SPI2 CS0 的 IO_MUX 位置 [3]——但 CS 不算 bus 引脚，走 GPIO 矩阵也不影响直连，没必要为 CS 牺牲串口。'
    },
    {
      gpio: 17,
      availability: 'caution',
      tags: [{ label: 'U0RXD', kind: 'uart' }],
      cats: [],
      note: 'UART0 默认 RX [5][6]，串口烧录 / 日志通道。占用后串口方式不可用（还有 USB 口可救）。复用 FSPICS1，基本用不上。'
    },
    {
      gpio: 18,
      availability: 'free',
      tags: [{ label: 'SDIO_CMD', kind: 'misc' }],
      cats: ['free'],
      note: '自由脚。复用 SDIO slave 的 CMD [1]，不做 SDIO 从机就无影响。Arduino 默认 SPI 的 SS 在此脚 [6]。'
    },
    {
      gpio: 19,
      availability: 'free',
      tags: [{ label: 'SDIO_CLK', kind: 'misc' }],
      cats: ['free'],
      note: '自由脚。复用 SDIO slave 的 CLK [1]。Arduino 默认 SPI 的 MOSI 在此脚 [6]——注意这不是 IO_MUX 位置，默认引脚的 SPI 只在 40MHz 内可靠。'
    },
    {
      gpio: 20,
      availability: 'free',
      tags: [{ label: 'SDIO_DATA0', kind: 'misc' }],
      cats: ['free'],
      note: '自由脚。复用 SDIO slave 的 DATA0 [1]。Arduino 默认 SPI 的 MISO 在此脚 [6]。'
    },
    {
      gpio: 21,
      availability: 'free',
      tags: [{ label: 'SDIO_DATA1', kind: 'misc' }],
      cats: ['free'],
      note: '自由脚。复用 SDIO slave 的 DATA1 [1]。Arduino 默认 SPI 的 SCK 在此脚 [6]。'
    },
    {
      gpio: 22,
      availability: 'free',
      tags: [{ label: 'SDIO_DATA2', kind: 'misc' }],
      cats: ['free'],
      note: '自由脚。复用 SDIO slave 的 DATA2 [1]。Arduino 默认 I2C 的 SCL 在此脚 [6]，记得上拉。'
    },
    {
      gpio: 23,
      availability: 'free',
      tags: [{ label: 'SDIO_DATA3', kind: 'misc' }],
      cats: ['free'],
      note: '自由脚。复用 SDIO slave 的 DATA3 [1]。Arduino 默认 I2C 的 SDA 在此脚 [6]，记得上拉。'
    },
    {
      gpio: 24,
      label: 'GPIO24–30',
      availability: 'avoid',
      tags: [{ label: 'flash 占用', kind: 'flash' }],
      cats: [],
      note: '接内置/模组 flash：SPICS0=24、SPIQ=25、SPIWP=26、VDD_SPI=27、SPIHD=28、SPICLK=29、SPID=30 [1]，官方明确不建议挪作他用 [2]。WROOM-1 模组不引出这 7 个脚，当它们不存在；QFN40 裸片 + 外置 flash 画板同理，这组脚留给自己的 flash。'
    }
  ]
}
