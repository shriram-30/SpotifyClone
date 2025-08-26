// Create a simple history object that works with Vite
const createHistory = () => {
  const listeners = [];
  let location = window.location;
  
  const notify = () => {
    listeners.forEach(listener => listener(location));
  };

  // Listen to popstate events (back/forward button)
  window.addEventListener('popstate', () => {
    location = window.location;
    notify();
  });

  return {
    get location() {
      return location;
    },
    listen(listener) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },
    push(path, state) {
      window.history.pushState(state, '', path);
      location = window.location;
      notify();
    },
    replace(path, state) {
      window.history.replaceState(state, '', path);
      location = window.location;
      notify();
    },
    go(n) {
      window.history.go(n);
    },
    goBack() {
      window.history.back();
    },
    goForward() {
      window.history.forward();
    }
  };
};

export const history = createHistory();

export const navigate = (path, options = {}) => {
  const { replace = false, state = {} } = options;
  if (replace) {
    history.replace(path, state);
  } else {
    history.push(path, state);
  }
};

export const goBack = () => {
  history.goBack();
};

export const goForward = () => {
  history.goForward();
};
