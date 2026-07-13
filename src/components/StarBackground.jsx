import React from "react";

/**
 * 星星背景组件
 * 使用 love.jpg 作为全屏背景图
 */
export default function StarBackground() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
        backgroundImage: "url(" + import.meta.env.BASE_URL + "bg/love.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
