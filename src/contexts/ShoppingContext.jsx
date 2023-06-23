import React, { useContext, useState } from 'react';

const ShoppingContext = React.createContext();

export function useShopping() {
  return useContext(ShoppingContext);
}

export function ShoppingProvider({ children }) {
  const [shoppingCart, setShoppingCart] = useState(JSON.parse(localStorage.getItem('shoppingCart')) || []);

  function addToCart(itemId, quantity) {
    let newCart = [];
    if (shoppingCart.find((item) => item.id === itemId)) {
      newCart = shoppingCart.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: quantity,
          };
        } else {
          return item;
        }
      });
    } else {
      newCart = [...shoppingCart, { id: itemId, quantity }];
    }

    setShoppingCart(newCart);
    localStorage.setItem('shoppingCart', JSON.stringify(newCart));
  }

  function removeFromCart(itemId) {
    const newCart = shoppingCart.filter((item) => item.id !== itemId);

    setShoppingCart(newCart);
    localStorage.setItem('shoppingCart', JSON.stringify(newCart));
  }

  function removeAllFromCart() {
    setShoppingCart([]);
    localStorage.removeItem('shoppingCart');
  }

  const value = {
    shoppingCart,
    setShoppingCart,
    addToCart,
    removeFromCart,
    removeAllFromCart,
  };

  return <ShoppingContext.Provider value={value}>{children}</ShoppingContext.Provider>;
}