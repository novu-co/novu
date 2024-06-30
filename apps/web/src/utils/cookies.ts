import Cookies from 'js-cookie';

type LocationAttributes = {
  path?: string;
  domain?: string;
};

export function createCookieHandler(cookieName: string) {
  return {
    get() {
      return Cookies.get(cookieName);
    },

    set(newValue: string, options: Cookies.CookieAttributes = {}): void {
      Cookies.set(cookieName, newValue, options);
    },

    remove(locationAttributes?: LocationAttributes) {
      Cookies.remove(cookieName, locationAttributes);
    },

    getOnce(locationAttributes?: LocationAttributes) {
      const value = Cookies.get(cookieName);
      this.remove(locationAttributes);

      return value;
    },
  };
}

export const novuRedirectURLCookie = createCookieHandler('nv_redirect_url');

/*
 * TODO: Store the onboarding step in the cookie and resume the flow from that step on page reload.
 * For now we just store 1.
 */
export const novuOnboardedCookie = createCookieHandler('nv_onboarding_step');
