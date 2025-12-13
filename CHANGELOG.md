# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2024-12-13

### Added
- Request signing with RS512 (RSA with SHA-512) support
- New `signature` configuration option in `PaybinConfig`
- Support for loading private keys from environment variables, file paths, or direct strings
- Documentation for secret management integration (AWS, GCP, Azure, HashiCorp Vault)

## [1.0.0] - 2024-12-12

### Added
- Initial release
- Full TypeScript support
- Deposit API (createAddress, getAddress)
- Withdraw API (add, verifyStart, verifyConfirmAmount, getWithdrawableAssets)
- Balance API (get, getBySymbol)
- Webhook verification utilities
- Complete type definitions
- Support for all Paybin networks and cryptocurrencies
- Sandbox and production environment support
