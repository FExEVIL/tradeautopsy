declare module 'react-calendar-heatmap' {
  import { ComponentType } from 'react'

  export interface CalendarHeatmapValue {
    date: string | Date
    count?: number
    [key: string]: any
  }

  export interface CalendarHeatmapProps {
    startDate: Date
    endDate: Date
    values: CalendarHeatmapValue[]
    classForValue?: (value: CalendarHeatmapValue | null) => string
    titleForValue?: (value: CalendarHeatmapValue | null) => string
    tooltipDataAttrs?: (value: CalendarHeatmapValue | null) => Record<string, string>
    onClick?: (value: CalendarHeatmapValue | null) => void
    onMouseOver?: (event: React.MouseEvent<SVGRectElement>, value: CalendarHeatmapValue | null) => void
    onMouseLeave?: (event: React.MouseEvent<SVGRectElement>, value: CalendarHeatmapValue | null) => void
    showWeekdayLabels?: boolean
    showMonthLabels?: boolean
    showOutOfRangeDays?: boolean
    horizontal?: boolean
    gutterSize?: number
    transformDayElement?: (element: React.ReactElement, value: CalendarHeatmapValue, index: number) => React.ReactElement
  }

  const CalendarHeatmap: ComponentType<CalendarHeatmapProps>
  export default CalendarHeatmap
}

declare module 'react-calendar-heatmap/dist/styles.css'
