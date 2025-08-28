import {
  LGPDConsentimentoSchema,
  CreateLGPDConsentimentoSchema,
  LGPDSolicitacaoSchema,
  FormularioConsentimentoSchema,
  SolicitacaoPortabilidadeSchema,
  SolicitacaoExclusaoSchema,
  TipoConsentimentoSchema,
  StatusSolicitacaoSchema,
} from './lgpd';

describe('LGPD Schemas', () => {
  describe('TipoConsentimentoSchema', () => {
    it('accepts valid consent types', () => {
      const validTypes = [
        'marketing',
        'analytics',
        'compartilhamento',
        'cookies',
        'tratamento_dados',
        'comunicacao',
        'localizacao',
        'biometria',
      ];

      validTypes.forEach((type) => {
        expect(() => TipoConsentimentoSchema.parse(type)).not.toThrow();
      });
    });

    it('rejects invalid consent types', () => {
      expect(() => TipoConsentimentoSchema.parse('invalid_type')).toThrow();
      expect(() => TipoConsentimentoSchema.parse('')).toThrow();
      expect(() => TipoConsentimentoSchema.parse(null)).toThrow();
    });
  });

  describe('StatusSolicitacaoSchema', () => {
    it('accepts valid status values', () => {
      const validStatuses = ['pendente', 'em_analise', 'atendida', 'recusada', 'cancelada'];

      validStatuses.forEach((status) => {
        expect(() => StatusSolicitacaoSchema.parse(status)).not.toThrow();
      });
    });

    it('rejects invalid status values', () => {
      expect(() => StatusSolicitacaoSchema.parse('invalid_status')).toThrow();
    });
  });

  describe('LGPDConsentimentoSchema', () => {
    const validConsent = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      profile_id: '123e4567-e89b-12d3-a456-426614174001',
      unidade_id: '123e4567-e89b-12d3-a456-426614174002',
      tipo_consentimento: 'marketing',
      finalidade: 'Envio de ofertas promocionais por email',
      consentimento_dado: true,
      data_consentimento: '2024-01-01T00:00:00Z',
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...',
      versao_termos: '1.0',
      revogado: false,
      origem: 'web',
    };

    it('validates complete consent object', () => {
      const result = LGPDConsentimentoSchema.parse(validConsent);
      expect(result).toEqual(validConsent);
    });

    it('applies default values correctly', () => {
      const minimalConsent = {
        profile_id: '123e4567-e89b-12d3-a456-426614174001',
        unidade_id: '123e4567-e89b-12d3-a456-426614174002',
        tipo_consentimento: 'marketing',
        finalidade: 'Envio de ofertas promocionais',
        consentimento_dado: true,
      };

      const result = LGPDConsentimentoSchema.parse(minimalConsent);
      expect(result.versao_termos).toBe('1.0');
      expect(result.revogado).toBe(false);
      expect(result.origem).toBe('web');
    });

    it('validates UUID formats', () => {
      const invalidUuid = { ...validConsent, profile_id: 'invalid-uuid' };
      expect(() => LGPDConsentimentoSchema.parse(invalidUuid)).toThrow();
    });

    it('validates finalidade length', () => {
      const shortFinalidade = { ...validConsent, finalidade: 'short' };
      expect(() => LGPDConsentimentoSchema.parse(shortFinalidade)).toThrow();
    });
  });

  describe('CreateLGPDConsentimentoSchema', () => {
    it('omits auto-generated fields', () => {
      const createData = {
        profile_id: '123e4567-e89b-12d3-a456-426614174001',
        unidade_id: '123e4567-e89b-12d3-a456-426614174002',
        tipo_consentimento: 'marketing',
        finalidade: 'Envio de ofertas promocionais',
        consentimento_dado: true,
        versao_termos: '1.0',
      };

      const result = CreateLGPDConsentimentoSchema.parse(createData);
      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('data_consentimento');
      expect(result).not.toHaveProperty('data_revogacao');
    });
  });

  describe('LGPDSolicitacaoSchema', () => {
    const validRequest = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      profile_id: '123e4567-e89b-12d3-a456-426614174001',
      unidade_id: '123e4567-e89b-12d3-a456-426614174002',
      tipo_solicitacao: 'portabilidade',
      status: 'pendente',
      prazo_limite: '2024-02-01',
      protocolo: 'LGPD-2024-001',
    };

    it('validates complete request object', () => {
      const result = LGPDSolicitacaoSchema.parse(validRequest);
      expect(result.status).toBe('pendente');
    });

    it('requires required fields', () => {
      const { profile_id, ...incomplete } = validRequest;
      expect(() => LGPDSolicitacaoSchema.parse(incomplete)).toThrow();
    });

    it('validates URL format for arquivo_resposta_url', () => {
      const withInvalidUrl = {
        ...validRequest,
        arquivo_resposta_url: 'not-a-url',
      };
      expect(() => LGPDSolicitacaoSchema.parse(withInvalidUrl)).toThrow();

      const withValidUrl = {
        ...validRequest,
        arquivo_resposta_url: 'https://example.com/file.pdf',
      };
      expect(() => LGPDSolicitacaoSchema.parse(withValidUrl)).not.toThrow();
    });
  });

  describe('FormularioConsentimentoSchema', () => {
    const validForm = {
      consentimentos: [
        {
          tipo: 'marketing',
          finalidade: 'Envio de ofertas',
          obrigatorio: false,
          consentimento: true,
        },
      ],
      aceite_termos: true,
      aceite_privacidade: true,
      versao_termos: '1.0',
    };

    it('validates complete form', () => {
      const result = FormularioConsentimentoSchema.parse(validForm);
      expect(result.aceite_termos).toBe(true);
      expect(result.aceite_privacidade).toBe(true);
    });

    it('requires terms acceptance', () => {
      const withoutTerms = { ...validForm, aceite_termos: false };
      expect(() => FormularioConsentimentoSchema.parse(withoutTerms)).toThrow();
    });

    it('requires privacy acceptance', () => {
      const withoutPrivacy = { ...validForm, aceite_privacidade: false };
      expect(() => FormularioConsentimentoSchema.parse(withoutPrivacy)).toThrow();
    });

    it('applies default version', () => {
      const { versao_termos, ...withoutVersion } = validForm;
      const result = FormularioConsentimentoSchema.parse(withoutVersion);
      expect(result.versao_termos).toBe('1.0');
    });
  });

  describe('SolicitacaoPortabilidadeSchema', () => {
    const validRequest = {
      formato: 'json',
      dados_solicitados: ['dados_pessoais', 'agendamentos'],
      motivo: 'Preciso dos dados para outro sistema',
      email_entrega: 'usuario@example.com',
    };

    it('validates complete portability request', () => {
      const result = SolicitacaoPortabilidadeSchema.parse(validRequest);
      expect(result.formato).toBe('json');
    });

    it('requires at least one data type', () => {
      const withoutData = { ...validRequest, dados_solicitados: [] };
      expect(() => SolicitacaoPortabilidadeSchema.parse(withoutData)).toThrow();
    });

    it('validates email format', () => {
      const withInvalidEmail = {
        ...validRequest,
        email_entrega: 'invalid-email',
      };
      expect(() => SolicitacaoPortabilidadeSchema.parse(withInvalidEmail)).toThrow();
    });

    it('validates motivo length', () => {
      const withShortMotivo = { ...validRequest, motivo: 'short' };
      expect(() => SolicitacaoPortabilidadeSchema.parse(withShortMotivo)).toThrow();
    });

    it('applies default format', () => {
      const { formato, ...withoutFormat } = validRequest;
      const result = SolicitacaoPortabilidadeSchema.parse(withoutFormat);
      expect(result.formato).toBe('json');
    });
  });

  describe('SolicitacaoExclusaoSchema', () => {
    const validDeletion = {
      tipo_exclusao: 'parcial',
      motivo: 'Não quero mais receber comunicações de marketing da empresa',
      confirmo_exclusao: true,
      ciente_irreversibilidade: true,
    };

    it('validates complete deletion request', () => {
      const result = SolicitacaoExclusaoSchema.parse(validDeletion);
      expect(result.tipo_exclusao).toBe('parcial');
    });

    it('requires confirmation', () => {
      const withoutConfirmation = { ...validDeletion, confirmo_exclusao: false };
      expect(() => SolicitacaoExclusaoSchema.parse(withoutConfirmation)).toThrow();
    });

    it('requires awareness acknowledgment', () => {
      const withoutAwareness = {
        ...validDeletion,
        ciente_irreversibilidade: false,
      };
      expect(() => SolicitacaoExclusaoSchema.parse(withoutAwareness)).toThrow();
    });

    it('validates motivo length', () => {
      const withShortMotivo = { ...validDeletion, motivo: 'short reason' };
      expect(() => SolicitacaoExclusaoSchema.parse(withShortMotivo)).toThrow();
    });

    it('accepts optional dados_manter field', () => {
      const withDataToKeep = {
        ...validDeletion,
        dados_manter: ['dados_pessoais', 'agendamentos'],
      };
      const result = SolicitacaoExclusaoSchema.parse(withDataToKeep);
      expect(result.dados_manter).toHaveLength(2);
    });
  });
});
