import React, { FunctionComponent, useContext, PropsWithoutRef } from 'react'
import Parent from './utils/Parent'
import OrderContext from '../context/OrderContext'
import _ from 'lodash'
import ItemContext from '../context/ItemContext'
import getCurrentItemKey from '../utils/getCurrentItemKey'
import components from '../config/components'
import { FunctionChildren } from '../typings/index'
import { AddToCartReturn } from 'reducers/OrderReducer'
import SkuListsContext from '../context/SkuListsContext'

const propTypes = components.AddToCartButton.propTypes
const defaultProps = components.AddToCartButton.defaultProps
const displayName = components.AddToCartButton.displayName

type AddToCartButtonChildrenProps = FunctionChildren<
  {
    handleClick: () => AddToCartReturn
  } & Omit<AddToCartButtonProps, 'children'> &
    PropsWithoutRef<JSX.IntrinsicElements['button']>
>

type AddToCartButtonProps = {
  children?: AddToCartButtonChildrenProps
  label?: string
  skuCode?: string
  disabled?: boolean
  skuListId?: string
  timeout?: number
} & PropsWithoutRef<JSX.IntrinsicElements['button']>

const AddToCartButton: FunctionComponent<AddToCartButtonProps> = (props) => {
  const {
    label = 'Add to cart',
    children,
    skuCode,
    disabled,
    skuListId,
    timeout = 1000,
    ...p
  } = props
  const { addToCart } = useContext(OrderContext)
  const {
    item,
    items,
    quantity,
    option,
    prices,
    lineItems,
    lineItem,
    skuCode: itemSkuCode,
  } = useContext(ItemContext)
  const { skuLists } = useContext(SkuListsContext)
  const sCode =
    !_.isEmpty(items) && skuCode
      ? items[skuCode]?.code
      : skuCode || getCurrentItemKey(item) || (itemSkuCode as string)
  const handleClick = (e: any) => {
    // e.preventDefault()
    const qty = quantity[sCode]
    const opt = option[sCode]
    const customLineItem = !_.isEmpty(lineItem) ? lineItem : lineItems[sCode]
    if (!_.isEmpty(skuLists) && skuListId) {
      const slQty = quantity[skuListId]
      let offset = timeout
      if (_.has(skuLists, skuListId)) {
        // return Promise.all(
        return skuLists[skuListId].map(async (skuCode) => {
          return setTimeout(async () => {
            new Promise((resolve) => setTimeout(resolve, offset)).then(() => {
              addToCart({
                skuCode,
                quantity: slQty,
              })
            })
            offset += timeout
            return { success: true }
          }, offset)
        })
        // )
      }
    }
    return addToCart({
      skuCode: sCode,
      skuId: item[sCode]?.id,
      quantity: qty,
      option: opt,
      lineItem: customLineItem,
    })
  }
  const autoDisabled =
    !_.isEmpty(skuLists) || skuListId
      ? false
      : disabled || !prices[sCode] || !sCode
  const parentProps = {
    handleClick,
    disabled: disabled || autoDisabled,
    label,
    ...props,
  }
  return children ? (
    <Parent {...parentProps}>{children}</Parent>
  ) : (
    <button disabled={autoDisabled} onClick={handleClick} {...p}>
      {label}
    </button>
  )
}

AddToCartButton.propTypes = propTypes
AddToCartButton.defaultProps = defaultProps
AddToCartButton.displayName = displayName

export default AddToCartButton
