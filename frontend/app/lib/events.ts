// 🔥 Event Bus globale FixPoint (semplice e sicuro)

type Listener = () => void;

const listeners: Listener[] = [];

export function subscribeQuotes(fn: Listener) {
  listeners.push(fn);

  return () => {
    const i = listeners.indexOf(fn);
    if (i !== -1) listeners.splice(i, 1);
  };
}

export function notifyQuotesUpdate() {
  listeners.forEach((fn) => fn());
}
