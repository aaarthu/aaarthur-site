# Guia de Integração WordPress + Deploy

Este guia explica como hospedar seu site React e integrá-lo com WordPress como CMS headless.

## Arquitetura Recomendada

```
┌─────────────────────────────────────────────────────────────────┐
│                        USUÁRIO                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL / NETLIFY                              │
│                 (Hospeda o site React)                           │
│            https://seusite.com.br                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WORDPRESS                                   │
│                  (CMS para projetos)                             │
│         https://admin.seusite.com.br/wp-json/                    │
└─────────────────────────────────────────────────────────────────┘
```

## Passo 1: Configurar WordPress

### 1.1 Instalar WordPress

- Hospede o WordPress em um servidor (ex: Hostgator, DigitalOcean, AWS Lightsail)
- Recomendamos usar um subdomínio: `admin.seusite.com.br` ou `cms.seusite.com.br`

### 1.2 Instalar Plugins Necessários

1. **Advanced Custom Fields (ACF)** - Para campos personalizados
2. **ACF to REST API** - Para expor campos ACF na API
3. **WP REST Cache** - Para cache da API (opcional, melhora performance)

### 1.3 Criar Custom Post Type "Projetos"

Adicione ao `functions.php` do seu tema ou use o plugin **Custom Post Type UI**:

```php
function register_projetos_post_type() {
    $args = array(
        'public' => true,
        'label'  => 'Projetos',
        'show_in_rest' => true,
        'supports' => array('title', 'editor', 'thumbnail'),
        'menu_icon' => 'dashicons-portfolio',
    );
    register_post_type('projetos', $args);
}
add_action('init', 'register_projetos_post_type');
```

### 1.4 Configurar Campos ACF

Crie um grupo de campos chamado "Dados do Projeto" com:

| Campo | Nome do campo | Tipo |
|-------|---------------|------|
| Categoria | `categoria` | Texto |
| Descrição | `descricao` | Área de texto |
| Ano | `ano` | Texto |
| Cliente | `cliente` | Texto |
| Função | `funcao` | Texto |
| Galeria | `galeria` | Galeria |

### 1.5 Habilitar CORS

Adicione ao `functions.php`:

```php
function add_cors_headers() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
}
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        return $value;
    });
});
```

## Passo 2: Deploy do Site React

### Opção A: Vercel (Recomendado)

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente:
   ```
   VITE_WORDPRESS_URL=https://admin.seusite.com.br
   ```
3. Deploy automático a cada push

### Opção B: Netlify

1. Conecte seu repositório ao Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configure variáveis de ambiente no painel

### Opção C: Hospedagem Tradicional

1. Execute `npm run build`
2. Faça upload da pasta `dist/` para o servidor
3. Configure o servidor para SPA (todas as rotas → index.html)

## Passo 3: Configurar Variável de Ambiente

No arquivo `.env` do projeto (para desenvolvimento local):

```env
VITE_WORDPRESS_URL=https://seu-wordpress.com.br
```

No servidor de produção, configure a mesma variável através do painel do Vercel/Netlify.

## Passo 4: Testar a Integração

1. Acesse `https://seu-wordpress.com.br/wp-json/wp/v2/projetos` para verificar a API
2. Verifique se os projetos aparecem no site
3. Se não houver projetos ou erro, o site usa os dados de fallback locais

## Estrutura de Dados da API

### Endpoint de Projetos
```
GET /wp-json/wp/v2/projetos?_embed&per_page=100
```

### Resposta Esperada
```json
{
  "id": 1,
  "title": { "rendered": "Nome do Projeto" },
  "acf": {
    "categoria": "Identidade Visual",
    "descricao": "Descrição do projeto...",
    "ano": "2024",
    "cliente": "Nome do Cliente",
    "funcao": "Designer",
    "galeria": [
      { "url": "https://...", "alt": "Imagem 1" }
    ]
  },
  "_embedded": {
    "wp:featuredmedia": [
      { "source_url": "https://..." }
    ]
  }
}
```

## Internacionalização (i18n)

O site está configurado com suporte a dois idiomas:
- **Português (pt)** - Idioma padrão
- **Inglês (en)**

### Arquivos de Tradução
- `src/i18n/locales/pt.json` - Textos em português
- `src/i18n/locales/en.json` - Textos em inglês

### Como Funciona
1. O idioma é detectado automaticamente pelo navegador
2. O usuário pode trocar pelo seletor PT/EN no header
3. A preferência é salva no localStorage

### Para Projetos Multilíngues no WordPress

Instale o plugin **WPML** ou **Polylang** para gerenciar traduções dos projetos.

## Domínio Personalizado

### No Vercel
1. Vá em Settings → Domains
2. Adicione seu domínio
3. Configure os registros DNS conforme instruções

### No Netlify
1. Vá em Site settings → Domain management
2. Adicione domínio personalizado
3. Configure registros DNS

## Checklist Final

- [ ] WordPress instalado e funcionando
- [ ] Plugin ACF + ACF to REST API instalados
- [ ] Custom Post Type "projetos" criado
- [ ] Campos ACF configurados
- [ ] CORS habilitado no WordPress
- [ ] Site React deployado (Vercel/Netlify)
- [ ] Variável `VITE_WORDPRESS_URL` configurada
- [ ] Domínio personalizado configurado (opcional)
- [ ] SSL/HTTPS ativo em ambos os sites

## Suporte

Se encontrar problemas:
1. Verifique o console do navegador para erros
2. Teste a API do WordPress diretamente no navegador
3. Confirme que as variáveis de ambiente estão corretas
4. O site possui fallback para dados locais em caso de falha

---

Criado por Lovable • [docs.lovable.dev](https://docs.lovable.dev)
