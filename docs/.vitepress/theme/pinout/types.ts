/**
 * 芯片引脚图的数据 schema。
 * 每块芯片一份数据文件（docs/posts/data/<chip>.ts），由 <PinoutViewer> 渲染；
 * 数据文件头部须以注释标注官方出处，字段逐条可溯源。
 */

/** 引脚可用性：free 自由使用 / caution 有前提或副作用 / avoid 勿用 */
export type Availability = 'free' | 'caution' | 'avoid'

/** 标签类别，决定配色（样式见 PinoutViewer.vue） */
export type TagKind =
  | 'spi' //   高速外设 IO_MUX 复用
  | 'hot' //   实底强调，如 80MHz 直连标记
  | 'adc' //   模拟功能
  | 'strap' // strapping 引脚
  | 'usb' //   USB 相关
  | 'uart' //  串口相关
  | 'flash' // 被 flash 等占用
  | 'misc' //  其它中性说明

export interface PinTag {
  label: string
  kind: TagKind
}

export interface Pin {
  /** GPIO 编号（合并行取首个编号） */
  gpio: number
  /** 显示名，缺省为 GPIO<gpio>；合并行如「GPIO11–17」 */
  label?: string
  availability: Availability
  /** 引脚行上的功能标签，按 TagKind 声明顺序排列（spi → hot → adc → strap → usb → uart → flash → misc） */
  tags: PinTag[]
  /** 所属筛选类别，key 对应 ChipPinout.filters */
  cats: string[]
  /** 点击后详情面板显示的完整说明 */
  note: string
}

export interface PinFilter {
  key: string
  label: string
}

export interface ChipPinout {
  /** 芯片名，如 ESP32-C3 */
  name: string
  /** 内核 / 封装等副标题 */
  subtitle: string
  /** 按展示顺序排列；组件均分为左右两列 */
  pins: Pin[]
  filters: PinFilter[]
}
