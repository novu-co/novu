import { Hooks } from "./types.js";

/*
 * This file is only ever generated once on the first generation and then is free to be modified.
 * Any hooks you wish to add should be registered in the initHooks function. Feel free to define them
 * in this file or in separate files in the hooks folder.
 */

// @ts-expect-error remove this line when you add your first hook and hooks is used
export function initHooks(hooks: Hooks) {
  // Add hooks by calling hooks.register{ClientInit/BeforeCreateRequest/BeforeRequest/AfterSuccess/AfterError}Hook
  // with an instance of a hook that implements that specific Hook interface
  // Hooks are registered per SDK instance, and are valid for the lifetime of the SDK instance
}
