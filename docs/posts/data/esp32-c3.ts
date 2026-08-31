import type { ChipPinout } from '../../.vitepress/theme/pinout/types'

/**
 * ESP32-C3 引脚数据。核验于 2026-08-31，出处：
 *
 * [1] ESP32-C3 Datasheet §Strapping Pins（表 3-1/3-3/3-4）
 *     https://documentation.espressif.com/esp32-c3_datasheet_en.html
 * [2] ESP-IDF · GPIO & RTC GPIO (ESP32-C3)
 *     https://docs.espressif.com/projects/esp-idf/en/latest/esp32c3/api-reference/peripherals/gpio.html
 * [3] ESP-IDF · SPI Master Driver (ESP32-C3)，IO_MUX 引脚表与 GPIO 矩阵频率说明
 *     https://docs.espressif.com/projects/esp-idf/en/latest/esp32c3/api-reference/peripherals/spi_master.html
 * [4] ESP-IDF · ADC Oneshot (ESP32-C3)，ADC2 errata 说明
 *     https://docs.espressif.com/projects/esp-idf/en/latest/esp32c3/api-reference/peripherals/adc/adc_oneshot.html
 * [5] esptool · Boot Mode Selection (ESP32-C3)
 *     https://docs.espressif.com/projects/esptool/en/latest/esp32c3/advanced-topics/boot-mode-selection.html
 * [6] ESP32-C3-DevKitM-1 User Guide（板载 RGB 灯、UART0 引脚）
 *     https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32c3/esp32-c3-devkitm-1/user_guide.html
 * [7] arduino-esp32 · variants/esp32c3/pins_arduino.h（Arduino 默认引脚）
 *     https://github.com/espressif/arduino-esp32/blob/master/variants/esp32c3/pins_arduino.h
 * [8] ESP Hardware Design Guidelines · ESP32-C3 Schematic Checklist（VDD_SPI 作 GPIO、flash 走线）
 *     https://docs.espressif.com/projects/esp-hardware-design-guidelines/en/latest/esp32c3/schematic-checklist.html
 */
export const esp32c3: ChipPinout = {
  name: 'ESP32-C3',
  subtitle: 'RISC-V · QFN32',
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
      note: 'RTC 域引脚，可做深度睡眠唤醒 [2]；复用 XTAL_32K_P（外接 32K 晶振时占用）。无上电限制，可放心用。'
    },
    {
      gpio: 1,
      availability: 'free',
      tags: [{ label: 'ADC1_CH1', kind: 'adc' }],
      cats: ['adc', 'sleep', 'free'],
      note: 'RTC 域引脚，可做深度睡眠唤醒 [2]；复用 XTAL_32K_N。无上电限制，可放心用。'
    },
    {
      gpio: 2,
      availability: 'caution',
      tags: [
        { label: 'FSPIQ=MISO', kind: 'spi' },
        { label: '80M', kind: 'hot' },
        { label: 'ADC1_CH2', kind: 'adc' },
        { label: 'Strap', kind: 'strap' }
      ],
      cats: ['spi80', 'adc', 'sleep', 'strap'],
      note: 'Strapping：实际不决定启动模式，但默认浮空，官方建议上拉以防上电毛刺（表 3-3 [1]）。启动后可正常使用，是 SPI2 唯一的 IO_MUX MISO——80MHz 全双工读必须用它 [3]。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 3,
      availability: 'free',
      tags: [{ label: 'ADC1_CH3', kind: 'adc' }],
      cats: ['adc', 'sleep', 'free'],
      note: '完全自由的引脚，适合 DC / RST / 背光 / 按键等杂活。RTC 域，可深睡唤醒 [2]。'
    },
    {
      gpio: 4,
      availability: 'free',
      tags: [
        { label: 'FSPIHD', kind: 'spi' },
        { label: 'ADC1_CH4', kind: 'adc' }
      ],
      cats: ['adc', 'sleep', 'free'],
      note: 'FSPIHD 只有四线 QSPI 才用到 [3]，普通 SPI 场景下它就是自由引脚；也是硬件 JTAG 的 MTMS（默认走 USB-JTAG，通常空闲）。RTC 域，可深睡唤醒。'
    },
    {
      gpio: 5,
      availability: 'free',
      tags: [
        { label: 'FSPIWP', kind: 'spi' },
        { label: 'ADC2 ✗', kind: 'misc' }
      ],
      cats: ['sleep', 'free'],
      note: '当普通 GPIO 用没问题。其 ADC2_CH0 因硬件缺陷 oneshot 模式已不受支持（官方 errata，读数不稳 [4]），别在这脚做 ADC。FSPIWP 仅四线 QSPI 用到；硬件 JTAG 的 MTDI。RTC 域，可深睡唤醒。'
    },
    {
      gpio: 6,
      availability: 'free',
      tags: [
        { label: 'FSPICLK=SCLK', kind: 'spi' },
        { label: '80M', kind: 'hot' }
      ],
      cats: ['spi80', 'free'],
      note: 'SPI2 时钟的 IO_MUX 位置——要超过 40MHz，SCLK 只能是它，否则整条总线走 GPIO 矩阵，只在 40MHz 内可靠 [3]。无高速 SPI 需求时可当普通 GPIO；硬件 JTAG 的 MTCK。'
    },
    {
      gpio: 7,
      availability: 'free',
      tags: [
        { label: 'FSPID=MOSI', kind: 'spi' },
        { label: '80M', kind: 'hot' }
      ],
      cats: ['spi80', 'free'],
      note: 'SPI2 MOSI 的 IO_MUX 位置——超过 40MHz 时 MOSI 只能是它 [3]。硬件 JTAG 的 MTDO。'
    },
    {
      gpio: 8,
      availability: 'caution',
      tags: [
        { label: 'Strap ↑', kind: 'strap' },
        { label: '板载 WS2812', kind: 'misc' }
      ],
      cats: ['strap'],
      note: 'Strapping：正常 SPI Boot 时电平任意，仅进下载模式时要求为 1（表 3-3 [1]），默认浮空，板上通常已上拉。别接会在复位时拉低它的负载：拉低进不了下载模式，与 GPIO9 同时为 0 更是非法组合 [5]。它还控制 ROM 启动日志是否打印。DevKitM-1 在此脚接了 WS2812 RGB 灯 [6]。Arduino 默认 I2C 的 SDA 在此脚 [7]——I2C 上拉与 strapping 要求正好相容。'
    },
    {
      gpio: 9,
      availability: 'caution',
      tags: [
        { label: 'Strap', kind: 'strap' },
        { label: 'BOOT 键', kind: 'misc' }
      ],
      cats: ['strap'],
      note: 'Strapping：内部弱上拉（约 45k）[1][5]；上电拉低即进下载模式，就是板上的 BOOT 键。适合做低电平有效的按键输入，别接会在复位时拉低它的负载。Arduino 默认 I2C 的 SCL 在此脚 [7]。'
    },
    {
      gpio: 10,
      availability: 'free',
      tags: [
        { label: 'FSPICS0=CS', kind: 'spi' },
        { label: '80M', kind: 'hot' }
      ],
      cats: ['spi80', 'free'],
      note: 'SPI2 CS0 的 IO_MUX 位置 [3]。CS 不算 bus 引脚，走 GPIO 矩阵也不影响直连，但这脚空着就直接用它。'
    },
    {
      gpio: 11,
      label: 'GPIO11–17',
      availability: 'avoid',
      tags: [{ label: 'flash 占用', kind: 'flash' }],
      cats: [],
      note: 'GPIO11 是 flash 的供电脚（VDD_SPI），GPIO12–17 是 flash 的 SPI0/1 总线，官方明确不建议挪作他用 [1][2]。模组和内置 flash 变体不引出这 7 个脚，当它们不存在；裸片 + 外置 flash 画板时 12–17 接自己的 flash。VDD_SPI 不作供电脚（flash 由 3.3V 直供）时可当普通 GPIO11 用 [8]——引脚紧张的设计能多抠出一个脚。'
    },
    {
      gpio: 18,
      availability: 'caution',
      tags: [{ label: 'USB D−', kind: 'usb' }],
      cats: [],
      note: 'USB Serial/JTAG 的 D−，改作 GPIO 即失去 USB 烧录与调试 [2]；上电有 USB 枚举活动，别接毛刺敏感的负载。'
    },
    {
      gpio: 19,
      availability: 'caution',
      tags: [{ label: 'USB D+', kind: 'usb' }],
      cats: [],
      note: 'USB Serial/JTAG 的 D+，USB 功能激活时有内部上拉；改作 GPIO 即失去 USB 烧录与调试 [2]。'
    },
    {
      gpio: 20,
      availability: 'caution',
      tags: [{ label: 'U0RXD', kind: 'uart' }],
      cats: [],
      note: 'UART0 默认 RX [6]，串口烧录 / 日志通道。占用后串口方式不可用（还有 USB 口可救）。'
    },
    {
      gpio: 21,
      availability: 'caution',
      tags: [{ label: 'U0TXD', kind: 'uart' }],
      cats: [],
      note: 'UART0 默认 TX [6]，串口日志输出。占用后看不到串口 log。复位后它会输出 ROM 启动日志，引脚翻转，别接上电敏感负载 [5]。'
    }
  ]
}
