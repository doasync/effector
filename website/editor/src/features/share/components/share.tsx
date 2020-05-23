import {styled} from 'linaria/react'
import {Button} from './button'

export const SharedUrl = styled.input`
  background: #fff;
  padding: 0.5rem 1rem;
  border: none;
  outline: none;
  width: 100%;
  border-bottom: 1px solid #ddd;

  &[value=''] {
    visibility: hidden;
  }
`

export const ShareButton = styled(Button)`
  border-radius: 2px;
  padding: 0.5rem 1rem;
  border-width: 0;
  margin: 0;
  margin-left: 6px;
  white-space: nowrap;
  transition: width 0.25s;
`

export const ShareGroup = styled.div`
  background-color: #f7f7f7;
  border-left: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  grid-column: 3 / span 1;
  grid-row: 2 / span 1;

  @media (max-width: 699px) {
    grid-column: 1 / span 1;
    grid-row: 2 / span 1;
  }
`
