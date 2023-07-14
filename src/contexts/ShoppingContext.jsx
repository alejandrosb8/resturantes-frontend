import React, { useContext, useState } from 'react';

const ShoppingContext = React.createContext();

export function useShopping() {
  return useContext(ShoppingContext);
}

export function ShoppingProvider({ children }) {
  const [shoppingCart, setShoppingCart] = useState(JSON.parse(localStorage.getItem('shoppingCart')) || []);

  function addToCart(itemId, quantity, details) {
    let newCart = [];
    if (shoppingCart.find((item) => item.id === itemId)) {
      newCart = shoppingCart.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity: quantity,
            details: details,
          };
        } else {
          return item;
        }
      });
    } else {
      newCart = [...shoppingCart, { id: itemId, quantity, details }];
    }

    const newCartToAdd = newCart.filter((item) => item.quantity > 0);

    setShoppingCart(newCartToAdd);
    localStorage.setItem('shoppingCart', JSON.stringify(newCartToAdd));
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

  function editCart(newCart) {
    const newCartToAdd = newCart.filter((item) => item.quantity > 0);
    console.log(newCartToAdd);

    setShoppingCart(newCartToAdd);
    localStorage.setItem('shoppingCart', JSON.stringify(newCartToAdd));
  }

  const value = {
    shoppingCart,
    setShoppingCart,
    addToCart,
    removeFromCart,
    removeAllFromCart,
    editCart,
  };

  return <ShoppingContext.Provider value={value}>{children}</ShoppingContext.Provider>;
}
