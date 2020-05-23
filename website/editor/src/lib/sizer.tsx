import React from 'react'
import {styled} from 'linaria/react'
import debounce from 'lodash.debounce'

interface Props {
  direction: 'vertical' | 'horizontal'
  color?: string
  border?: string
  size?: string
  style?: object
  cssVar: string
  container: HTMLElement | null
  sign: number
  max?: number | string
  min?: number
  middle?: number | string
  hover?: string
}

const DOUBLE_CLICK_TIMEOUT = 250
const background = document.getElementById('dimmer')!
const params: {start: number | null; param: number | null} = {
  start: null,
  param: null,
}

let lastClick = 0
let lastZoom = '0'
let bodyUserSelect = ''

const saveSettings = debounce((key, value) => {
  try {
    const settings =
      JSON.parse(localStorage.getItem('layout-settings') ?? '{}') || {}
    settings[key] = value
    localStorage.setItem('layout-settings', JSON.stringify(settings))
  } catch (error) {
    console.error('saveSettings error', error)
  }
}, 250)

export const Sizer: React.FC<Props> = ({
  direction,
  color = '#ddd',
  border = 'rgba(0, 0, 0, .15)',
  size = '6px',
  style,
  cssVar,
  container,
  sign,
  children,
  max: maxim = direction === 'horizontal'
    ? window.innerHeight
    : window.innerWidth,
  min: minim = 0,
  middle = 0,
  ...props
}) => {
  const max = String(maxim)
  const min = String(minim)
  const ref = React.useRef<HTMLDivElement | null>(null)
  const handleMouseMove = React.useCallback(
    (event: MouseEvent) => {
      const shift =
        (direction === 'vertical' ? event.pageX : event.pageY) -
        (params.start ?? 0)
      const newValue = `${Math.floor((params.param ?? 0) + shift * sign)}px`
      document.body.style.setProperty(cssVar, newValue)
      saveSettings(cssVar, newValue)
    },
    [direction, sign],
  )

  const handleMouseUp = React.useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    background.style.display = 'none'
    document.body.style.userSelect = bodyUserSelect
  }, [handleMouseMove])

  const handleMouseDown = (event: MouseEvent) => {
    const prevLastClick = lastClick
    lastClick = Date.now()
    if (Date.now() - prevLastClick < DOUBLE_CLICK_TIMEOUT) {
      const currentValue = String(document.body.style.getPropertyValue(cssVar))
      let zoom
      if (currentValue === min || currentValue === max) {
        zoom = middle
        lastZoom = currentValue
      } else if (lastZoom === min) {
        zoom = max
        lastZoom = max
      } else if (lastZoom === max) {
        zoom = min
        lastZoom = min
      }
      document.body.style.setProperty(cssVar, String(zoom ?? '0'))
      saveSettings(cssVar, zoom)
      return
    }
    background.style.cursor =
      direction === 'vertical' ? 'col-resize' : 'row-resize'
    background.style.display = 'block'
    bodyUserSelect = document.body.style.userSelect || ''
    document.body.style.userSelect = 'none'

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    if (direction === 'vertical') {
      params.start = event.pageX
      params.param = getCoords(container!).width
    } else {
      params.start = event.pageY
      params.param = getCoords(container!).height
    }
  }

  React.useEffect(() => {
    ref.current?.addEventListener('mousedown', handleMouseDown)
    return () => {
      ref.current?.removeEventListener('mousedown', handleMouseDown)
    }
  }, [container])

  return (
    <StyledSizer
      className="layout-sizer"
      ref={ref}
      direction={direction}
      color={color}
      border={border}
      size={size}
      style={style}
      {...props}>
      {children}
    </StyledSizer>
  )
}

interface StyledSizerProps {
  border: string
  className?: string
  color: string
  direction: 'vertical' | 'horizontal'
  hover?: number
  ref: any
  size: string
  style?: object
}

const StyledSizer = styled.div<StyledSizerProps>`
  flex: 0 0 ${props => props.size};
  width: ${props => (props.direction === 'vertical' ? props.size : '100%')};
  height: ${props => (props.direction === 'horizontal' ? props.size : '100%')};
  background-color: ${props => props.color};
  cursor: ${props =>
    props.direction === 'horizontal' ? 'row-resize' : 'col-resize'};
  border-left: ${setBorder('vertical')};
  border-right: ${setBorder('vertical')};
  border-top: ${setBorder('horizontal')};
  border-bottom: ${setBorder('horizontal')};
  &:hover {
    opacity: ${props => props.hover || 0.5};
  }
`

function setBorder(dir: 'vertical' | 'horizontal') {
  return (props: StyledSizerProps) =>
    props.direction === dir ? `1px solid ${props.border}` : 'none'
}

function getCoords(element: HTMLElement) {
  const box = element.getBoundingClientRect()

  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset,
    width: box.width,
    height: box.height,
  }
}
