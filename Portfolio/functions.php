<?php
function arthur_enqueue_react_build() {
  $dist_path = get_template_directory() . '/dist';
  $dist_uri  = get_template_directory_uri() . '/dist';

  // Mensagem 1: functions.php foi carregado
  add_action('wp_head', function () {
    echo "\n<!-- FUNCTIONS OK: functions.php está rodando -->\n";
  });

  $manifest_file = $dist_path . '/manifest.json';

  // Mensagem 2: manifest existe?
  if (!file_exists($manifest_file)) {
    add_action('wp_head', function () use ($manifest_file) {
      echo "\n<!-- ERRO: manifest NÃO encontrado em: {$manifest_file} -->\n";
    });
    return;
  }

  $manifest = json_decode(file_get_contents($manifest_file), true);
  if (!is_array($manifest)) {
    add_action('wp_head', function () {
      echo "\n<!-- ERRO: manifest inválido (json_decode falhou) -->\n";
    });
    return;
  }

  // Escolhe a entrada principal do Vite
  $entry = 'index.html';
  if (!isset($manifest[$entry])) {
    // fallback: pega a primeira chave do manifest
    $keys = array_keys($manifest);
    $entry = $keys[0] ?? null;
  }

  if (!$entry || !isset($manifest[$entry])) {
    add_action('wp_head', function () {
      echo "\n<!-- ERRO: não encontrei a entrada principal no manifest -->\n";
    });
    return;
  }

  $main = $manifest[$entry];

  // Mensagem 3: qual entrada ele escolheu?
  add_action('wp_head', function () use ($entry) {
    echo "\n<!-- MANIFEST OK: entry usada = {$entry} -->\n";
  });

  // CSS
  if (!empty($main['css']) && is_array($main['css'])) {
    foreach ($main['css'] as $i => $css) {
      wp_enqueue_style('arthur-style-' . $i, $dist_uri . '/' . $css, array(), null);
    }
  }

  // JS
  if (empty($main['file'])) {
    add_action('wp_head', function () {
      echo "\n<!-- ERRO: manifest não tem main['file'] (JS principal) -->\n";
    });
    return;
  }

  $js = $dist_uri . '/' . $main['file'];

  // Mensagem 4: qual JS ele vai carregar?
  add_action('wp_head', function () use ($js) {
    echo "\n<!-- VAI CARREGAR JS: {$js} -->\n";
  });

  wp_enqueue_script('arthur-app', $js, array(), null, true);
  wp_script_add_data('arthur-app', 'type', 'module');
  wp_script_add_data('arthur-app', 'crossorigin', 'anonymous');
}
add_action('wp_enqueue_scripts', 'arthur_enqueue_react_build');

// Força o script do app a sair como type="module"
add_filter('script_loader_tag', function ($tag, $handle, $src) {
  if ($handle === 'arthur-app') {
    return '<script type="module" src="' . esc_url($src) . '" crossorigin="anonymous"></script>';
  }
  return $tag;
}, 10, 3);
