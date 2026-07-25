if (!("window" in globalThis)) {
  const testWindow = {
    location: { search: "" },
    parent: { postMessage: () => undefined },
    addEventListener: (
      type: string,
      listener: (event: { origin: string; data: unknown }) => void,
    ) => {
      if (type === "message") {
        listener({
          origin: "",
          data: {
            id: "OBR_READY",
            data: { ref: "test-ref", userId: "test-user" },
          },
        });
      }
    },
    removeEventListener: () => undefined,
    setTimeout,
  };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: testWindow,
  });
}
