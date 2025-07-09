# quasar-chat (quasar-chat)

A Quasar Project

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

```
passos importantes para ficar esperto

- google-services.json esta na pasta src-capacitor/android/app ?

- em src-capacitor/android/build.gradle adicionar em dependences
     classpath 'com.google.gms:google-services:4.4.2'
- verificar se tem
try {
    def servicesJSON = file('google-services.json')
    if (servicesJSON.text) {
        apply plugin: 'com.google.gms.google-services'
    }
} catch(Exception e) {
    logger.info("google-services.json not found, google-services plugin not applied. Push Notifications won't work")
}


se nao tiver adicionar
     apply plugin: 'com.google.gms.google-services'

em android/app/build.gradle
```
