export const toast = {
  success: (msg: string) => {
    if (typeof window !== "undefined") {
      console.log("[toast success]", msg);
      // Simple DOM toast
      const el = document.createElement("div");
      el.textContent = msg;
      el.style.cssText = "position:fixed;bottom:20px;right:20px;background:#fff;color:#000;padding:12px 20px;border-radius:12px;font-size:14px;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.3);";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  },
  error: (msg: string) => {
    if (typeof window !== "undefined") {
      console.error("[toast error]", msg);
      const el = document.createElement("div");
      el.textContent = msg;
      el.style.cssText = "position:fixed;bottom:20px;right:20px;background:#ef4444;color:#fff;padding:12px 20px;border-radius:12px;font-size:14px;z-index:9999;";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }
  },
};
