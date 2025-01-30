## 2.1.5 (2024-12-24)

### 🚀 Features

- **dashboard:** new integrations page view ([#7310](https://github.com/novuhq/novu/pull/7310))
- **dashboard:** Nv 4885 push step editor ([#7306](https://github.com/novuhq/novu/pull/7306))
- **api:** Nv 5045 update the api to have same behavior as preference ([#7302](https://github.com/novuhq/novu/pull/7302))
- **api:** add query parser ([#7267](https://github.com/novuhq/novu/pull/7267))
- **api:** Nv 5033 additional removal cycle found unneeded elements ([#7283](https://github.com/novuhq/novu/pull/7283))
- **dashboard:** Activity Feed Page - Stacked PR ([#7249](https://github.com/novuhq/novu/pull/7249))
- **dashboard:** digest fixed duration ([#7234](https://github.com/novuhq/novu/pull/7234))
- **api:** Nv 4966 e2e testing happy path - messages ([#7248](https://github.com/novuhq/novu/pull/7248))
- **api:** add external id api to onesignal Based on #6976 ([#7270](https://github.com/novuhq/novu/pull/7270), [#6976](https://github.com/novuhq/novu/issues/6976))
- **api:** add push control schema ([#7252](https://github.com/novuhq/novu/pull/7252))
- **api:** add chat control schema ([#7251](https://github.com/novuhq/novu/pull/7251))
- **api:** add sms control schema ([#7250](https://github.com/novuhq/novu/pull/7250))
- **api:** add full step data to workflow dto; refactor ([#7235](https://github.com/novuhq/novu/pull/7235))
- **dashboard:** Billing settings page in dashboard v2 ([#7203](https://github.com/novuhq/novu/pull/7203))
- **dashboard:** Implement email step editor & mini preview ([#7129](https://github.com/novuhq/novu/pull/7129))
- **api:** Nv 4939 e2e testing happy path events ([#7208](https://github.com/novuhq/novu/pull/7208))
- **dashboard:** Getting started page ([#7132](https://github.com/novuhq/novu/pull/7132))
- **api:** converted bulk trigger to use SDK ([#7166](https://github.com/novuhq/novu/pull/7166))
- **api:** wip fix framework workflow issues ([#7147](https://github.com/novuhq/novu/pull/7147))
- **api:** fix framework workflow payload preview ([#7137](https://github.com/novuhq/novu/pull/7137))
- **application-generic:** add SUBSCRIBER_WIDGET_JWT_EXPIRATION_TIME env variable ([#7105](https://github.com/novuhq/novu/pull/7105))
- **dashboard:** Sign up Questionnaire ([#7114](https://github.com/novuhq/novu/pull/7114))

### 🩹 Fixes

- **api-service:** digest schema - remove the schema defaults as it doesn't work with the framework ajv validation ([#7334](https://github.com/novuhq/novu/pull/7334))
- **api:** @novu/api -> @novu/api-service ([#7348](https://github.com/novuhq/novu/pull/7348))
- **api:** Crate of fixes part 2 ([#7292](https://github.com/novuhq/novu/pull/7292))
- **api:** centralize upsert validation  + improve nested error handling ([#7173](https://github.com/novuhq/novu/pull/7173))
- **dashboard:** nested payload gen ([#7240](https://github.com/novuhq/novu/pull/7240))
- **dashboard:** Always trust the URL for the environment selection ([#7223](https://github.com/novuhq/novu/pull/7223))

### ❤️ Thank You

- Adam Chmara @ChmaraX
- Biswajeet Das @BiswaViraj
- Dima Grossman @scopsy
- GalTidhar @tatarco
- George Desipris @desiprisg
- George Djabarov @djabarovgeorge
- Pawan Jain
- Paweł Tymczuk @LetItRock
- Sokratis Vidros @SokratisVidros


## 2.1.4 (2024-11-26)

### 🚀 Features

- **dashboard:** Codemirror liquid filter support ([#7122](https://github.com/novuhq/novu/pull/7122))
- **root:** add support chat app ID to environment variables in d… ([#7120](https://github.com/novuhq/novu/pull/7120))
- **worker:** add defer duration validation ([#7088](https://github.com/novuhq/novu/pull/7088))
- **root:** Add base Dockerfile for GHCR with Node.js and dependencies ([#7100](https://github.com/novuhq/novu/pull/7100))

### 🩹 Fixes

- **api:** Migrate subscriber global preferences before workflow preferences ([#7118](https://github.com/novuhq/novu/pull/7118))
- **api:** Nv 4836 v2 dashboard workflows show error in old dashboard ([#7106](https://github.com/novuhq/novu/pull/7106))
- **api, dal, framework:** fix the uneven and unused dependencies ([#7103](https://github.com/novuhq/novu/pull/7103))
- **api:** Nv 4823 no validation around bad urls + 400 in client ([#7092](https://github.com/novuhq/novu/pull/7092))

### ❤️  Thank You

- GalTidhar @tatarco
- George Desipris @desiprisg
- George Djabarov @djabarovgeorge
- Himanshu Garg @merrcury
- Richard Fontein @rifont

## 2.0.2 (2024-11-19)

### 🚀 Features

- **api:** update patch dto ([#7041](https://github.com/novuhq/novu/pull/7041))
- **web, dashboard, api, shared:** Add enhanced `slugify` to handle multilingual, special, and emoji characters ([#7025](https://github.com/novuhq/novu/pull/7025))
- **dal,web:** add plain support service hash for live chat ([#6908](https://github.com/novuhq/novu/pull/6908))
- **api:** add tags issues ([#6957](https://github.com/novuhq/novu/pull/6957))
- **api:** Fix previous steps ([#6905](https://github.com/novuhq/novu/pull/6905))
- **api:** Billing alerts on usage emails ([#6883](https://github.com/novuhq/novu/pull/6883))
- **api:** Add Error Handling 2XX issues ([#6884](https://github.com/novuhq/novu/pull/6884))
- **dashboard:** in-app editor form driven by BE schema ([#6877](https://github.com/novuhq/novu/pull/6877))
- **web:** v3 dashboard opt-in widget ([#6873](https://github.com/novuhq/novu/pull/6873))
- **api:** Complete email preview logic ([#6772](https://github.com/novuhq/novu/pull/6772))
- **dashboard:** In app template preview ([#6843](https://github.com/novuhq/novu/pull/6843))
- **api:** add support for env switch by slug ([#6828](https://github.com/novuhq/novu/pull/6828))
- **dashboard:** workflow promotion ([#6804](https://github.com/novuhq/novu/pull/6804))
- **api:** move step-schema to step ([#6810](https://github.com/novuhq/novu/pull/6810))
- **dashboard:** Nv 4511 configure step the preview section ([#6806](https://github.com/novuhq/novu/pull/6806))
- **api:** treat workflow name as editable, non-unique values ([#6780](https://github.com/novuhq/novu/pull/6780))
- **dashboard:** test workflow functionality ([#6768](https://github.com/novuhq/novu/pull/6768))
- **api:** add promote workflow endpoint ([#6771](https://github.com/novuhq/novu/pull/6771))
- **dashboard:** workflow editor error handling + sentry ([#6776](https://github.com/novuhq/novu/pull/6776))
- **api:** revert to full slug ([#6756](https://github.com/novuhq/novu/pull/6756))
- **api:** add slug parser in the api requests ([#6705](https://github.com/novuhq/novu/pull/6705))
- **api:** Add preview endpoint ([#6648](https://github.com/novuhq/novu/pull/6648))
- **api:** Add Novu-managed Bridge endpoint per environment ([#6451](https://github.com/novuhq/novu/pull/6451))
- **api:** add workflow trigger identifier parity ([#6657](https://github.com/novuhq/novu/pull/6657))
- **web:** Request company size during sign-up ([#6676](https://github.com/novuhq/novu/pull/6676))
- **api:** add status ([#6616](https://github.com/novuhq/novu/pull/6616))
- **api:** Move workflows to shared ([#6602](https://github.com/novuhq/novu/pull/6602))
- **web:** use Stripe checkout instead of web elements ([#6544](https://github.com/novuhq/novu/pull/6544))
- **api:** add v2 workflow api crud ([#6460](https://github.com/novuhq/novu/pull/6460))
- **web:** add usage widget; simplify subscription provider ([#6583](https://github.com/novuhq/novu/pull/6583))
- **shared, web, application-generic:** Create util for building preferences ([#6503](https://github.com/novuhq/novu/pull/6503))
- **api:** add option to remove Novu branding in the inbox ([#6498](https://github.com/novuhq/novu/pull/6498))
- **web:** Add Workflow Preferences for Cloud & Studio ([#6447](https://github.com/novuhq/novu/pull/6447))
- **api:** store Stripe customer ids locally ([#6480](https://github.com/novuhq/novu/pull/6480))

### 🩹 Fixes

- **api:** Add a Patch Workflow endpoint ([#7019](https://github.com/novuhq/novu/pull/7019))
- **api:** add patch step api and consolidate post update processing ([#7015](https://github.com/novuhq/novu/pull/7015))
- **api:** bug bash preview issues resolved ([#6904](https://github.com/novuhq/novu/pull/6904))
- **api:** More fixes for broken e2e ([c02e1b224](https://github.com/novuhq/novu/commit/c02e1b224))
- **shared:** Remove all dependencies from @novu/shared ([#6891](https://github.com/novuhq/novu/pull/6891))
- **dashboard:** Make step prefix shorter ([c1f3f4aef](https://github.com/novuhq/novu/commit/c1f3f4aef))
- **dashboard:** Create workflow drawer fixes ([#6774](https://github.com/novuhq/novu/pull/6774))
- **api:** Return correct workflow.origin ([#6740](https://github.com/novuhq/novu/pull/6740))
- **api:** update previous step identifier to step id instead of inter… ([#6689](https://github.com/novuhq/novu/pull/6689))
- **root:** Build only public packages during preview deployments ([#6590](https://github.com/novuhq/novu/pull/6590))
- **worker, application-generic, shared:** Don't use Subscriber Prefs for Workflows with readonly Prefs ([#6581](https://github.com/novuhq/novu/pull/6581))

### ❤️  Thank You

- Adam Chmara
- Biswajeet Das
- David Southmountain @davidsoderberg
- Dima Grossman
- GalTidhar @tatarco
- George Desipris @desiprisg
- George Djabarov @djabarovgeorge
- Joel Anton
- Pawan Jain
- Paweł Tymczuk @LetItRock
- Richard Fontein @rifont
- Sokratis Vidros @SokratisVidros