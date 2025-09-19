# 🚀 Sistema de Feature Flags

Sistema centralizado para controle de funcionalidades em desenvolvimento, com suporte a múltiplos ambientes e configuração flexível.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Configuração](#configuração)
- [Como Usar](#como-usar)
- [Lista de Feature Flags](#lista-de-feature-flags)
- [Ambientes](#ambientes)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Componentes React](#componentes-react)
- [Boas Práticas](#boas-práticas)

## 🎯 Visão Geral

O sistema de feature flags permite:

- ✅ **Controle granular** de funcionalidades por ambiente
- ✅ **Override via variáveis de ambiente** em produção
- ✅ **Componentes React** para renderização condicional
- ✅ **Validação automática** de configurações
- ✅ **Performance otimizada** com cache inteligente
- ✅ **Suporte a dependências** entre flags

## ⚙️ Configuração

### Arquivo Principal: `src/featureFlags.ts`

```typescript
import { isFeatureFlagEnabled, useFeatureFlag, FeatureFlag } from '@/featureFlags';
```

### Estrutura das Feature Flags

```typescript
interface FeatureFlagConfig {
  flag: FeatureFlag;
  defaultEnabled: boolean;
  description: string;
  version?: string;
  deprecated?: boolean;
  removalDate?: string;
  dependencies?: FeatureFlag[];
  environments?: ('development' | 'staging' | 'production' | 'test')[];
}
```

## 🔧 Como Usar

### 1. Verificação Simples

```typescript
import { isFeatureFlagEnabled } from '@/featureFlags';

// Verificar se marketplace está habilitado
if (isFeatureFlagEnabled('marketplace')) {
  // Renderizar funcionalidade do marketplace
}
```

### 2. Hook React

```typescript
import { useFeatureFlag } from '@/featureFlags';

function MarketplaceButton() {
  const isMarketplaceEnabled = useFeatureFlag('marketplace');

  if (!isMarketplaceEnabled) return null;

  return <button>Acessar Marketplace</button>;
}
```

### 3. Componente de Feature Flag

```typescript
import { FeatureFlag } from '@/featureFlags';

function MyComponent() {
  return (
    <div>
      <h1>Minha Barbearia</h1>

      <FeatureFlag flag="marketplace">
        <MarketplaceSection />
      </FeatureFlag>

      <FeatureFlag flag="multi_unidades">
        <UnitsManager />
      </FeatureFlag>
    </div>
  );
}
```

### 4. Múltiplas Feature Flags

```typescript
import { MultipleFeatureFlags } from '@/featureFlags';

// Requer TODAS as flags ativas (mode="all")
<MultipleFeatureFlags flags={['marketplace', 'api_externa']} mode="all">
  <AdvancedMarketplaceIntegration />
</MultipleFeatureFlags>

// Requer PELO MENOS UMA flag ativa (mode="any")
<MultipleFeatureFlags flags={['relatorios_avancados', 'dashboard_v2']} mode="any">
  <AnalyticsSection />
</MultipleFeatureFlags>
```

## 📂 Lista de Feature Flags

### 🛒 Marketplace

- **Flag:** `marketplace`
- **Padrão:** `true`
- **Ambientes:** development, staging, production, test
- **Descrição:** Marketplace de serviços externos

### 🏢 Multi Unidades

- **Flag:** `multi_unidades`
- **Padrão:** `false`
- **Ambientes:** development, staging, test
- **Descrição:** Gestão de múltiplas unidades/filiais

### 📊 Relatórios Avançados

- **Flag:** `relatorios_avancados`
- **Padrão:** `true`
- **Ambientes:** development, staging, production, test
- **Descrição:** Relatórios com gráficos e análises detalhadas

### 🔔 Notificações Push

- **Flag:** `notificacoes_push`
- **Padrão:** `false`
- **Ambientes:** development, staging
- **Descrição:** Notificações push para clientes e funcionários

### 💳 Assinaturas

- **Flag:** `assinaturas`
- **Padrão:** `false`
- **Ambientes:** development
- **Descrição:** Sistema de assinaturas e planos recorrentes

### 🔗 API Externa

- **Flag:** `api_externa`
- **Padrão:** `false`
- **Ambientes:** development, staging
- **Descrição:** Integração com APIs de terceiros

### 🔍 Auditoria

- **Flag:** `auditoria`
- **Padrão:** `true`
- **Ambientes:** development, staging, production, test
- **Descrição:** Log de auditoria e rastreamento de ações

### 💰 POS Integrado

- **Flag:** `pos_integrado`
- **Padrão:** `false`
- **Ambientes:** development
- **Descrição:** Integração com sistemas POS/PDV

### 📅 Agenda Avançada

- **Flag:** `agenda_avancada`
- **Padrão:** `true`
- **Ambientes:** development, staging, production, test
- **Descrição:** Funcionalidades avançadas da agenda (recorrência, bloqueios)

### 👥 CRM Avançado

- **Flag:** `crm_avancado`
- **Padrão:** `false`
- **Ambientes:** development
- **Descrição:** CRM avançado com campanhas e automações

## 🌍 Ambientes

### Development

- **Todas as flags disponíveis**
- Ideal para desenvolvimento e testes de novas funcionalidades

### Staging

- **Flags estáveis em teste**
- Validação antes da produção

### Production

- **Apenas flags estáveis e testadas**
- Máxima confiabilidade

### Test

- **Ambiente de testes automatizados**
- Suporte completo para validação

## 🔧 Variáveis de Ambiente

Override qualquer feature flag via variável de ambiente:

```bash
# Formato: FEATURE_{NOME_DA_FLAG}
FEATURE_MARKETPLACE=true
FEATURE_MULTI_UNIDADES=false
FEATURE_RELATORIOS_AVANCADOS=1  # "1" também é aceito como true
```

### Exemplos

```bash
# .env.local para desenvolvimento
FEATURE_MARKETPLACE=true
FEATURE_ASSINATURAS=true

# .env.production para produção
FEATURE_MARKETPLACE=true
FEATURE_MULTI_UNIDADES=false
```

## ⚛️ Componentes React

### FeatureFlag

Renderiza children apenas se a flag estiver ativa:

```typescript
<FeatureFlag flag="marketplace">
  <MarketplaceComponent />
</FeatureFlag>
```

### MultipleFeatureFlags

Controla renderização baseada em múltiplas flags:

```typescript
// Todas devem estar ativas
<MultipleFeatureFlags flags={['marketplace', 'api_externa']} mode="all">
  <AdvancedComponent />
</MultipleFeatureFlags>

// Pelo menos uma deve estar ativa
<MultipleFeatureFlags flags={['feature1', 'feature2']} mode="any">
  <ConditionalComponent />
</MultipleFeatureFlags>
```

### Hook useFeatureFlag

```typescript
function MyComponent() {
  const isEnabled = useFeatureFlag('marketplace');
  const isAdvanced = useFeatureFlag('crm_avancado');

  return (
    <div>
      {isEnabled && <BasicFeature />}
      {isAdvanced && <AdvancedFeature />}
    </div>
  );
}
```

## ✅ Boas Práticas

### 1. Nomenclatura

- Use **snake_case** para nomes das flags
- Seja **descritivo** e **consistente**
- Prefira **positivo** sobre negativo (`marketplace` vs `no_marketplace`)

### 2. Configuração

- **Sempre documente** o propósito da flag
- **Configure ambientes apropriados**
- **Use valores padrão conservadores**

### 3. Código

- **Não abuse** de feature flags no código
- **Remova flags antigas** quando não precisar mais
- **Teste cenários** com flag ativa e inativa

### 4. Ambientes

- **Development:** Experimente livremente
- **Staging:** Teste funcionalidades estáveis
- **Production:** Apenas flags testadas e confiáveis

### 5. Ciclo de Vida

```typescript
// ❌ Evite
if (!isFeatureFlagEnabled('new_feature')) {
  // código antigo complexo
} else {
  // código novo
}

// ✅ Prefira
if (isFeatureFlagEnabled('new_feature')) {
  return <NewComponent />;
}
return <LegacyComponent />;
```

### 6. Performance

- O sistema **cache automaticamente** as verificações
- **Evite chamadas repetitivas** desnecessárias
- Use **componentes** quando possível

## 🧪 Testes

### Mockando Feature Flags nos Testes

```typescript
// Em seus testes
beforeEach(() => {
  process.env.FEATURE_MARKETPLACE = 'true';
  process.env.FEATURE_MULTI_UNIDADES = 'false';
});

afterEach(() => {
  delete process.env.FEATURE_MARKETPLACE;
  delete process.env.FEATURE_MULTI_UNIDADES;
});
```

### Testando Componentes

```typescript
import { render } from '@testing-library/react';
import { FeatureFlag } from '@/featureFlags';

test('renderiza com feature flag ativa', () => {
  process.env.FEATURE_MARKETPLACE = 'true';

  const { getByText } = render(
    <FeatureFlag flag="marketplace">
      <div>Marketplace</div>
    </FeatureFlag>
  );

  expect(getByText('Marketplace')).toBeInTheDocument();
});
```

## 🔍 Funções Utilitárias

### isFeatureFlagEnabled

```typescript
isFeatureFlagEnabled('marketplace'); // boolean
```

### getActiveFeatureFlags

```typescript
getActiveFeatureFlags(); // FeatureFlag[]
```

### areFeatureFlagsEnabled

```typescript
areFeatureFlagsEnabled(['marketplace', 'api_externa']); // boolean
```

### isFeatureFlagAvailableInEnvironment

```typescript
isFeatureFlagAvailableInEnvironment('marketplace'); // boolean
```

## 📝 Changelog

### v1.0.0

- ✅ Sistema base de feature flags
- ✅ Suporte a múltiplos ambientes
- ✅ Componentes React
- ✅ Override via variáveis de ambiente
- ✅ Validação automática
- ✅ Testes abrangentes

---

Para dúvidas ou sugestões, consulte a documentação técnica em `src/featureFlags.ts` ou abra uma issue no repositório.
