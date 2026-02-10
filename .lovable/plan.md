
# Plano: Corrigir Detecção de Cor de Fundo do Cursor Personalizado

## Diagnóstico

O cursor não muda para vermelho ao passar sobre o elemento amarelo devido à estrutura HTML atual. O fundo amarelo e o texto são elementos **irmãos**, não pai-filho:

```text
+-------------------------------+
| div.relative (transparent)    |
|   +------------------------+  |
|   | div.bg-[#f9b126] (z-0) |  | <- Fundo amarelo
|   +------------------------+  |
|   +------------------------+  |
|   | h1.z-10 (transparent)  |  | <- Texto branco
|   +------------------------+  |
+-------------------------------+
```

Quando `document.elementFromPoint()` detecta o cursor sobre o texto, retorna o `<h1>`. A função `getBackgroundColor` sobe pelos elementos ancestrais (`<h1>` → `<div.relative>` → etc.), mas o div amarelo é um irmão, não um ancestral, então nunca é encontrado.

## Solução

Modificar a estrutura HTML na página de Contato para que o fundo amarelo seja o **elemento pai** do texto, não um irmão:

**De (atual):**
```tsx
<div className="relative w-full max-w-4xl">
  <div className="absolute inset-0 bg-[#f9b126] z-0" />
  <h1 className="relative z-10 ...">BORA TRABALHAR JUNTOS</h1>
</div>
```

**Para (proposto):**
```tsx
<div 
  className="relative w-full max-w-4xl bg-[#f9b126] rounded-2xl md:rounded-3xl"
  style={{ transform: "skewX(-5deg)" }}
>
  <h1 
    className="font-zuume text-[2.5rem] md:text-[5rem] lg:text-[6.5rem] ..."
    style={{ transform: "skewX(5deg)" }}  {/* Contra-rotação para manter texto reto */}
  >
    BORA TRABALHAR JUNTOS
  </h1>
</div>
```

## Alterações Necessárias

### Arquivo: `src/pages/Contact.tsx`
- Linhas ~169-186
- Remover o div absoluto do fundo amarelo
- Aplicar o fundo amarelo diretamente no container pai
- Aplicar contra-rotação no texto para mantê-lo reto

## Resultado Esperado

Após a mudança, quando o cursor estiver sobre qualquer parte do elemento amarelo (incluindo o texto), a função `getBackgroundColor` encontrará o fundo amarelo subindo a hierarquia do DOM, e o cursor mudará para vermelho (`#db2432`) conforme esperado.

---

## Detalhes Técnicos

A hierarquia do DOM após a correção será:

```text
+-------------------------------------+
| div.bg-[#f9b126] (skewX -5deg)      |  <- Cursor detecta amarelo aqui
|   +-----------------------------+   |
|   | h1 (skewX +5deg, texto reto)|   |  <- Ou aqui (sobe para o pai)
|   +-----------------------------+   |
+-------------------------------------+
```

Isso garante que `element.parentElement` sempre encontre o div com fundo amarelo, independente de onde o cursor esteja posicionado dentro do componente.
