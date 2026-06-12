function updateRTL() {
  chrome.storage.local.get([
    'enabled', 'selectors', 'preserveCode', 'rtlUserPrompts', 'rtlUserInput',
    'fontEnabled', 'textFont', 'textFontSize',
    'codeFontEnabled', 'codeFont', 'codeFontSize'
  ], (data) => {
    const enabled = data.enabled !== undefined ? data.enabled : true;
    const preserveCode = data.preserveCode !== undefined ? data.preserveCode : true;
    const rtlUserPrompts = data.rtlUserPrompts !== undefined ? data.rtlUserPrompts : true;
    const rtlUserInput = data.rtlUserInput !== undefined ? data.rtlUserInput : false;
    const selectors = data.selectors || [];

    const fontEnabled = data.fontEnabled === true;
    const textFont = data.textFont || 'Vazirmatn';
    const textFontSize = data.textFontSize || 14;

    const codeFontEnabled = data.codeFontEnabled === true;
    const codeFont = data.codeFont || 'monospace';
    const codeFontSize = data.codeFontSize || 13;

    const forceStyle = document.getElementById('rtl-ext-style-force');
    if (forceStyle) forceStyle.remove();
    const forceFontLink = document.getElementById('rtl-ext-google-font-force');
    if (forceFontLink) forceFontLink.remove();

    const needsGoogleFont = (fontEnabled && textFont === 'Vazirmatn') || (codeFontEnabled && codeFont === 'Vazirmatn');
    let fontLink = document.getElementById('rtl-ext-google-font');
    if (needsGoogleFont) {
      if (!fontLink) {
        fontLink = document.createElement('link');
        fontLink.id = 'rtl-ext-google-font';
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700&display=swap';
        document.head.appendChild(fontLink);
      }
    } else {
      if (fontLink) fontLink.remove();
    }

    let styleEl = document.getElementById('rtl-ext-style');

    if (!enabled) {
      if (styleEl) styleEl.remove();
      return;
    }

    const activeSelectors = selectors.filter(s => s.active).map(s => s.text);

    if (activeSelectors.length === 0 && !rtlUserPrompts && !rtlUserInput && !fontEnabled && !codeFontEnabled) {
      if (styleEl) styleEl.remove();
      return;
    }

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'rtl-ext-style';
      document.head.appendChild(styleEl);
    }

    let cssRules = '';

    cssRules += activeSelectors.map(sel => {
      let rule = `${sel} { direction: rtl !important; }`;
      if (preserveCode) {
        rule += `\n${sel} code, ${sel} pre, ${sel} .code-block { direction: ltr !important; text-align: left !important; }`;
      } else {
        rule += `\n${sel} code, ${sel} pre, ${sel} .code-block { direction: rtl !important; text-align: right !important; }`;
      }
      return rule;
    }).join('\n');

    if (rtlUserPrompts) {
      const promptSelector = '.chat-turn-container.code-block-aligner.render.user.ng-star-inserted p.ng-star-inserted';
      cssRules += `\n${promptSelector} { direction: rtl !important; }`;
      if (preserveCode) {
        cssRules += `\n${promptSelector} code, ${promptSelector} pre { direction: ltr !important; text-align: left !important; }`;
      } else {
        cssRules += `\n${promptSelector} code, ${promptSelector} pre { direction: rtl !important; text-align: right !important; }`;
      }
    }

    if (rtlUserInput) {
      const inputSelector = '.prompt-box-container textarea';
      cssRules += `\n${inputSelector} { direction: rtl !important; }`;
    }

    if (fontEnabled) {
      const textTargets = [
        '.chat-turn-container.code-block-aligner.render.user.ng-star-inserted',
        '.chat-turn-container.code-block-aligner.model.render.ng-star-inserted',
        '.prompt-box-container textarea',
        '.chat-turn-container.code-block-aligner.render.user.ng-star-inserted *:not(pre):not(code):not(ms-code-block):not(pre *):not(code *):not(ms-code-block *):not(mat-icon):not(.mat-icon):not(i):not([class*="material-icons"]):not([class*="material-symbols"])',
        '.chat-turn-container.code-block-aligner.model.render.ng-star-inserted *:not(pre):not(code):not(ms-code-block):not(pre *):not(code *):not(ms-code-block *):not(mat-icon):not(.mat-icon):not(i):not([class*="material-icons"]):not([class*="material-symbols"])'
      ].join(', ');

      cssRules += `\n${textTargets} { font-family: "${textFont}", sans-serif !important; font-size: ${textFontSize}px !important; }`;
    }

    const iconExclusions = ':not(mat-icon):not(.mat-icon):not(i):not([class*="material-icons"]):not([class*="material-symbols"])';

    if (codeFontEnabled) {
      const codeTargets = [
        'ms-code-block',
        `ms-code-block *${iconExclusions}`,
        '.chat-turn-container pre',
        '.chat-turn-container code',
        `.chat-turn-container pre *${iconExclusions}`,
        `.chat-turn-container code *${iconExclusions}`
      ].join(', ');
      cssRules += `\n${codeTargets} { font-family: "${codeFont}", monospace !important; font-size: ${codeFontSize}px !important; }`;
    } else {
      if (fontEnabled) {
        const codeTargets = [
          'ms-code-block',
          `ms-code-block *${iconExclusions}`,
          '.chat-turn-container pre',
          '.chat-turn-container code',
          `.chat-turn-container pre *${iconExclusions}`,
          `.chat-turn-container code *${iconExclusions}`
        ].join(', ');
        cssRules += `\n${codeTargets} { font-family: monospace !important; }`;
      }
    }

    styleEl.textContent = cssRules;
  });
}

updateRTL();

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    updateRTL();
  }
});