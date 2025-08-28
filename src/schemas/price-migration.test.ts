import {
  convertPriceToTcents,
  convertCentsToPrice,
  normalizePriceField,
  normalizeDurationField,
  PriceCentsSchema,
  PriceCompatibilitySchema,
} from './index';

describe('Price Migration Helpers', () => {
  describe('convertPriceToTcents', () => {
    it('converte preços decimais para centavos corretamente', () => {
      expect(convertPriceToTcents(25.5)).toBe(2550);
      expect(convertPriceToTcents(10.0)).toBe(1000);
      expect(convertPriceToTcents(0.99)).toBe(99);
      expect(convertPriceToTcents(100.75)).toBe(10075);
    });

    it('arredonda corretamente valores com muitas casas decimais', () => {
      expect(convertPriceToTcents(25.999)).toBe(2600); // arredonda para cima
      expect(convertPriceToTcents(25.001)).toBe(2500); // arredonda para baixo
    });
  });

  describe('convertCentsToPrice', () => {
    it('converte centavos para preços decimais corretamente', () => {
      expect(convertCentsToPrice(2550)).toBe(25.5);
      expect(convertCentsToPrice(1000)).toBe(10.0);
      expect(convertCentsToPrice(99)).toBe(0.99);
      expect(convertCentsToPrice(10075)).toBe(100.75);
    });
  });

  describe('normalizePriceField', () => {
    it('prioriza price_cents quando ambos estão presentes', () => {
      const obj = { preco: 25.5, price_cents: 3000 };
      expect(normalizePriceField(obj)).toBe(3000);
    });

    it('usa preco convertido quando price_cents não está presente', () => {
      const obj = { preco: 25.5 };
      expect(normalizePriceField(obj)).toBe(2550);
    });

    it('usa price_cents quando preco não está presente', () => {
      const obj = { price_cents: 3000 };
      expect(normalizePriceField(obj)).toBe(3000);
    });

    it('retorna 0 quando nenhum campo está presente', () => {
      const obj = {};
      expect(normalizePriceField(obj)).toBe(0);
    });
  });

  describe('normalizeDurationField', () => {
    it('prioriza duration_minutes quando ambos estão presentes', () => {
      const obj = { duracao_min: 30, duration_minutes: 45 };
      expect(normalizeDurationField(obj)).toBe(45);
    });

    it('usa duracao_min quando duration_minutes não está presente', () => {
      const obj = { duracao_min: 30 };
      expect(normalizeDurationField(obj)).toBe(30);
    });

    it('usa duration_minutes quando duracao_min não está presente', () => {
      const obj = { duration_minutes: 45 };
      expect(normalizeDurationField(obj)).toBe(45);
    });

    it('retorna 0 quando nenhum campo está presente', () => {
      const obj = {};
      expect(normalizeDurationField(obj)).toBe(0);
    });
  });

  describe('PriceCentsSchema', () => {
    it('aceita valores válidos em centavos', () => {
      expect(() => PriceCentsSchema.parse(2550)).not.toThrow();
      expect(() => PriceCentsSchema.parse(1)).not.toThrow();
      expect(() => PriceCentsSchema.parse(9999999)).not.toThrow();
    });

    it('rejeita valores inválidos', () => {
      expect(() => PriceCentsSchema.parse(0)).toThrow(); // zero
      expect(() => PriceCentsSchema.parse(-100)).toThrow(); // negativo
      expect(() => PriceCentsSchema.parse(25.5)).toThrow(); // decimal
      expect(() => PriceCentsSchema.parse(10000000)).toThrow(); // muito alto
    });
  });

  describe('PriceCompatibilitySchema', () => {
    it('transforma objeto com preco para price_cents', () => {
      const input = { preco: 25.5 };
      const result = PriceCompatibilitySchema.parse(input);
      expect(result).toEqual({ price_cents: 2550 });
    });

    it('mantém price_cents quando já presente', () => {
      const input = { price_cents: 3000 };
      const result = PriceCompatibilitySchema.parse(input);
      expect(result).toEqual({ price_cents: 3000 });
    });

    it('usa price_cents quando ambos estão presentes', () => {
      const input = { preco: 25.5, price_cents: 3000 };
      const result = PriceCompatibilitySchema.parse(input);
      expect(result).toEqual({ price_cents: 3000 });
    });
  });

  describe('Cenários de migração', () => {
    it('simula migração gradual de dados', () => {
      // Dados antigos (só preco)
      const oldData = { preco: 25.5 };
      expect(normalizePriceField(oldData)).toBe(2550);

      // Dados em migração (ambos campos)
      const migrationData = { preco: 25.5, price_cents: 2550 };
      expect(normalizePriceField(migrationData)).toBe(2550);

      // Dados novos (só price_cents)
      const newData = { price_cents: 2550 };
      expect(normalizePriceField(newData)).toBe(2550);
    });

    it('mantém consistência na conversão de ida e volta', () => {
      const originalPrice = 25.5;
      const cents = convertPriceToTcents(originalPrice);
      const backToPrice = convertCentsToPrice(cents);
      expect(backToPrice).toBe(originalPrice);
    });
  });
});
