import React, { createContext, useContext, useReducer, useCallback } from 'react'

const CartContext = createContext()

const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      )
      if (existingItem) {
        return cartReducer(state, {
          type: 'UPDATE_ITEM',
          payload: {
            productId: action.payload.productId,
            quantity: existingItem.quantity + action.payload.quantity,
          },
        })
      }
      const newItems = [...state.items, action.payload]
      return calculateCart([...state.items, action.payload])
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(
        (item) => item.productId !== action.payload
      )
      return calculateCart(newItems)
    }
    case 'UPDATE_ITEM': {
      const newItems = state.items.map((item) =>
        item.productId === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      return calculateCart(newItems)
    }
    case 'CLEAR_CART':
      return initialState
    case 'SET_CART':
      return calculateCart(action.payload || [])
    default:
      return state
  }
}

function calculateCart(items) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  return {
    items,
    itemCount,
    total,
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const addItem = useCallback(
    (product, quantity = 1) => {
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          productId: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          image: product.image,
          quantity,
        },
      })
    },
    []
  )

  const removeItem = useCallback((productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }, [])

  const updateItem = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId)
    } else {
      dispatch({
        type: 'UPDATE_ITEM',
        payload: { productId, quantity },
      })
    }
  }, [removeItem])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const value = {
    ...state,
    addItem,
    removeItem,
    updateItem,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
