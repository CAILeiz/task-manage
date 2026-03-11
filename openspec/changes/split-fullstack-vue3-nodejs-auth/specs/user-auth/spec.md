## ADDED Requirements

### Requirement: 用户可以通过用户名和密码注册
系统 SHALL 允许用户使用用户名、邮箱和密码创建账户。

#### Scenario: 成功注册
- **WHEN** 用户提供有效的用户名、邮箱和密码调用注册 API
- **THEN** 系统创建新用户并返回 201 状态码和用户基本信息（不含密码）

#### Scenario: 用户名已存在
- **WHEN** 用户使用已存在的用户名调用注册 API
- **THEN** 系统返回 409 状态码和错误信息 "用户名已存在"

#### Scenario: 邮箱已存在
- **WHEN** 用户使用已存在的邮箱调用注册 API
- **THEN** 系统返回 409 状态码和错误信息 "邮箱已存在"

#### Scenario: 密码强度不足
- **WHEN** 用户使用少于 6 位字符的密码调用注册 API
- **THEN** 系统返回 400 状态码和错误信息 "密码长度至少6位"

### Requirement: 用户可以使用用户名/邮箱和密码登录
系统 SHALL 允许用户使用用户名或邮箱加密码登录，成功后返回 JWT Token。

#### Scenario: 成功登录
- **WHEN** 用户使用正确的用户名和密码调用登录 API
- **THEN** 系统返回 Access Token 和 Refresh Token

#### Scenario: 使用邮箱登录成功
- **WHEN** 用户使用正确的邮箱和密码调用登录 API
- **THEN** 系统返回 Access Token 和 Refresh Token

#### Scenario: 密码错误
- **WHEN** 用户使用错误的密码调用登录 API
- **THEN** 系统返回 401 状态码和错误信息 "用户名或密码错误"

#### Scenario: 用户不存在
- **WHEN** 使用不存在的用户名调用登录 API
- **THEN** 系统返回 401 状态码和错误信息 "用户名或密码错误"

### Requirement: 系统使用 JWT Token 进行身份认证
系统 SHALL 使用 JWT Token 验证用户身份，Access Token 有效期 2 小时，Refresh Token 有效期 7 天。

#### Scenario: 使用有效 Access Token 访问受保护资源
- **WHEN** 用户在请求头中提供有效的 Access Token 调用受保护 API
- **THEN** 系统允许访问并返回请求的数据

#### Scenario: Access Token 过期
- **WHEN** 用户使用过期的 Access Token 调用受保护 API
- **THEN** 系统返回 401 状态码和错误信息 "Token 已过期"

#### Scenario: 使用 Refresh Token 刷新 Access Token
- **WHEN** 用户使用有效的 Refresh Token 调用刷新 API
- **THEN** 系统返回新的 Access Token

#### Scenario: Refresh Token 过期
- **WHEN** 用户使用过期的 Refresh Token 调用刷新 API
- **THEN** 系统返回 401 状态码，要求用户重新登录

### Requirement: 用户可以登出系统
系统 SHALL 允许用户登出，登出后 Token 失效。

#### Scenario: 成功登出
- **WHEN** 已登录用户调用登出 API
- **THEN** 系统使当前 Token 失效并返回 200 状态码

### Requirement: 用户可以获取当前登录用户信息
系统 SHALL 允许已登录用户获取自己的基本信息。

#### Scenario: 获取当前用户信息成功
- **WHEN** 已登录用户调用获取用户信息 API
- **THEN** 系统返回用户 ID、用户名、邮箱等信息（不含密码）

#### Scenario: 未登录用户访问
- **WHEN** 未登录用户调用获取用户信息 API
- **THEN** 系统返回 401 状态码
