# Changelog

## [2.4.0](https://github.com/novuhq/novu/compare/framework-v2.3.0...framework-v2.4.0) (2024-11-12)


### Features

* **api:** Add Error Handling 2XX issues ([#6884](https://github.com/novuhq/novu/issues/6884)) ([fa0c234](https://github.com/novuhq/novu/commit/fa0c2344c324ba9a0f22d971f2a0bc6d4786cae4))
* **api:** Add preview endpoint ([#6648](https://github.com/novuhq/novu/issues/6648)) ([4b91fdf](https://github.com/novuhq/novu/commit/4b91fdf6d8794a520a49464665118d1ff22d5351))
* **api:** create step-schemas module ([#6482](https://github.com/novuhq/novu/issues/6482)) ([13317c4](https://github.com/novuhq/novu/commit/13317c4f5752fb79a76c710b0730e2cc0374d939))
* **framework, api, web, application-generic:** Add `name` and `description` to Framework workflow options ([#6708](https://github.com/novuhq/novu/issues/6708)) ([ec35a01](https://github.com/novuhq/novu/commit/ec35a01736b8c1fef4dddc1cf0368c1b37c84970))
* **framework, web, application-generic:** Propagate Bridge server errors to Bridge client ([#6726](https://github.com/novuhq/novu/issues/6726)) ([fc5b3cb](https://github.com/novuhq/novu/commit/fc5b3cb0b6a66ddd7cdf5e9933310be218d7725f))
* **framework,js:** expose the data property on the in-app step and notification object ([#6391](https://github.com/novuhq/novu/issues/6391)) ([8a14367](https://github.com/novuhq/novu/commit/8a143674f7ada2b0d276dc24d24e4f74b8ad9072))
* **framework:** Add `disableOutputSanitization` flag for channel step definitions ([#6521](https://github.com/novuhq/novu/issues/6521)) ([6740e50](https://github.com/novuhq/novu/commit/6740e50fcdd8ab1ca55b7635a1ba323fde764092))
* **framework:** Add `preferences` to `workflow` builder ([#6326](https://github.com/novuhq/novu/issues/6326)) ([5abdaaa](https://github.com/novuhq/novu/commit/5abdaaa9b523ba23872e684c2ab0544876f8c6f6))
* **framework:** Add NestJS `serve` handler ([#6654](https://github.com/novuhq/novu/issues/6654)) ([0e88116](https://github.com/novuhq/novu/commit/0e88116ff50442bdb39788d6ca703db43934aa6e))
* **framework:** Add support for specifying mock results ([#6878](https://github.com/novuhq/novu/issues/6878)) ([0238e2b](https://github.com/novuhq/novu/commit/0238e2baec1a73bc848bdee997296939ea47f91c))
* **framework:** Change framework capitalization: in_app -&gt; inApp ([#6477](https://github.com/novuhq/novu/issues/6477)) ([36e0596](https://github.com/novuhq/novu/commit/36e0596d5a69acaa0f25f16ba5633f9ac941a902))
* **framework:** CJS/ESM for framework ([#6707](https://github.com/novuhq/novu/issues/6707)) ([c51ed8f](https://github.com/novuhq/novu/commit/c51ed8fd803fc75bf944d03c4943b62f3f27680c))
* **framework:** cta support with target ([#6394](https://github.com/novuhq/novu/issues/6394)) ([6062699](https://github.com/novuhq/novu/commit/6062699a0c6b6ff49367a556ba08ea846ad3d92e))
* **framework:** Support Next.js 15 with Turbopack dev server ([#6894](https://github.com/novuhq/novu/issues/6894)) ([1e319e2](https://github.com/novuhq/novu/commit/1e319e2f672efc40e7296957440bc4e1b537d2e9))
* **novui, web, framework:** Step control autocomplete ([#6330](https://github.com/novuhq/novu/issues/6330)) ([5149f3d](https://github.com/novuhq/novu/commit/5149f3d6462965c295fb698363a01614a4659b79))
* **shared, web, application-generic:** Create util for building preferences ([#6503](https://github.com/novuhq/novu/issues/6503)) ([6f9ffec](https://github.com/novuhq/novu/commit/6f9ffec373ead9f7721e7e5098ae295bd905f0a2))


### Bug Fixes

* **framework, node:** Make the `payload` property optional during trigger ([#6384](https://github.com/novuhq/novu/issues/6384)) ([dae6a0c](https://github.com/novuhq/novu/commit/dae6a0c80ebc685849269fa266382ef2824d7aeb))
* **framework,dal:** fix the default redirect behaviour, support absolute and relative paths ([#6443](https://github.com/novuhq/novu/issues/6443)) ([4522dd3](https://github.com/novuhq/novu/commit/4522dd303246b176c95d378549f3c383e1a6f8d2))
* **framework:** add locale to subscriber ([#6165](https://github.com/novuhq/novu/issues/6165)) ([ffb7cc2](https://github.com/novuhq/novu/commit/ffb7cc29aede9290a30b969687b378c7650e4dc2))
* **framework:** Default to health action ([#6634](https://github.com/novuhq/novu/issues/6634)) ([afcdd8f](https://github.com/novuhq/novu/commit/afcdd8fba42dfaceca98c81006fd6c3fb9f95dbc))
* **framework:** Ensure all steps are logged during discovery and add step connector ([#6337](https://github.com/novuhq/novu/issues/6337)) ([40c0df1](https://github.com/novuhq/novu/commit/40c0df1270f7cf1bdec789b0a51e1dba177440a4))
* **framework:** Ensure missing schemas return unknown record type ([#6912](https://github.com/novuhq/novu/issues/6912)) ([b9185ed](https://github.com/novuhq/novu/commit/b9185edd7b63e0da742442f08ced4e294463ed82))
* **framework:** Ensure steps after skipped steps are executed ([#6371](https://github.com/novuhq/novu/issues/6371)) ([86772d3](https://github.com/novuhq/novu/commit/86772d30b5f167a6bf6c8d92ce1c09a42c498695))
* **framework:** Experiement with importing json-schema-faker ([#6762](https://github.com/novuhq/novu/issues/6762)) ([af72058](https://github.com/novuhq/novu/commit/af72058381912c5e5d10d338c72802e32a15ec6f))
* **framework:** Explicitly exit workflow evaluation early after evaluating specified `stepId` ([#6808](https://github.com/novuhq/novu/issues/6808)) ([2bdf840](https://github.com/novuhq/novu/commit/2bdf840ba98d96e89703e88d37b3bbbce5e6de3e))
* **framework:** Polish secretKey and apiUrl resolution ([#6819](https://github.com/novuhq/novu/issues/6819)) ([b0b97f3](https://github.com/novuhq/novu/commit/b0b97f302be987e3fc687ae9076de8a44ac6ffcc))
* **framework:** Prevent adding duplicate workflows ([#6913](https://github.com/novuhq/novu/issues/6913)) ([3ec534e](https://github.com/novuhq/novu/commit/3ec534eba7f87701ae09527b288d7641852ffade))
* **framework:** Resolve CJS issues this time with json-schema-faker ([#6766](https://github.com/novuhq/novu/issues/6766)) ([d6d4250](https://github.com/novuhq/novu/commit/d6d4250d32ee92475c11a6875dae512d3e6fcc48))
* **framework:** Specify `zod-to-json-schema` as a dependency ([#6741](https://github.com/novuhq/novu/issues/6741)) ([ca3dddc](https://github.com/novuhq/novu/commit/ca3dddc9127c6993c88d70813e144ebf0fb8717c))
* **framework:** Stop requiring default properties to be specified in outputs ([#6373](https://github.com/novuhq/novu/issues/6373)) ([cb80926](https://github.com/novuhq/novu/commit/cb80926aa329f4ec83260499463c163f6e6ef7af))
* **framework:** Stop validating controls for non previewed step ([#6876](https://github.com/novuhq/novu/issues/6876)) ([f6ed024](https://github.com/novuhq/novu/commit/f6ed024f9b15e6e1612bc3f56aa561329e1b4345))
* **framework:** Support json values in LiquidJS templates ([#6714](https://github.com/novuhq/novu/issues/6714)) ([baef280](https://github.com/novuhq/novu/commit/baef2807c0e375e312660feb4ad34c737e48b5db))
* **root:** Build only public packages during preview deployments ([#6590](https://github.com/novuhq/novu/issues/6590)) ([9aed977](https://github.com/novuhq/novu/commit/9aed97755ceb27e22d72927cf9e61e2aac1026c3))


### Performance Improvements

* **framework:** Replace all computed property keys with static declarations ([#6926](https://github.com/novuhq/novu/issues/6926)) ([d9e7968](https://github.com/novuhq/novu/commit/d9e796836db06b8ade510b9b9a55c4854b57b587))


### Reverts

* **root:** PR [#6754](https://github.com/novuhq/novu/issues/6754) ([#6856](https://github.com/novuhq/novu/issues/6856)) ([0999d22](https://github.com/novuhq/novu/commit/0999d2239917578fbee70c77a6628f3bc3f5291d))
