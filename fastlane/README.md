fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

### update_patch_notes

```sh
[bundle exec] fastlane update_patch_notes
```

Reescreve as notas de versao em metadata/ (sem texto, volta ao padrao de listing_texts.js)

### release_all

```sh
[bundle exec] fastlane release_all
```

Envio para Android e iOS (em sequencia, com as mesmas opcoes)

----


## Android

### android release

```sh
[bundle exec] fastlane android release
```

Envia o AAB (ultimo build ou aab:) para o Google Play com as notas de metadata/

### android download_listing

```sh
[bundle exec] fastlane android download_listing
```

Baixa a ficha publicada no Google Play para store_listing_current/android

### android upload_listing

```sh
[bundle exec] fastlane android upload_listing
```

Envia titulo, descricao curta e completa de store_listing/android (sem binario, imagens ou changelogs)

----


## iOS

### ios release

```sh
[bundle exec] fastlane ios release
```

Envia o IPA (ultimo build ou ipa:) para o TestFlight, ou para revisao da App Store com store:true

### ios download_listing

```sh
[bundle exec] fastlane ios download_listing
```

Baixa a ficha publicada na App Store para store_listing_current/ios

### ios upload_listing

```sh
[bundle exec] fastlane ios upload_listing
```

Envia nome, subtitulo, keywords, descricao e texto promocional de store_listing/ios (sem binario)

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
