# Exemplos Práticos

## Introdução

Este documento fornece exemplos práticos para ajudar desenvolvedores a implementar funcionalidades do sistema.

---

## Exemplo 1: Agendamentos

### Código

```javascript
import { criarAgendamento } from 'modulo-agendamentos';

const agendamento = criarAgendamento({
  cliente: 'João Silva',
  data: '2025-09-01',
  horario: '14:00',
});

console.log(agendamento);
```

---

## Exemplo 2: Integração com Asaas

### Código

```javascript
import { integrarAsaas } from 'modulo-asaas';

const resposta = integrarAsaas({
  chaveApi: 'sua-chave-api',
  dados: {
    cliente: 'Maria Oliveira',
    valor: 100.0,
  },
});

console.log(resposta);
```
