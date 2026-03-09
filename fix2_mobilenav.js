const fs = require('fs');

// Old mobile nav JS block (exact match across all pages)
const OLD_NAV_JS = `// Mobile nav
(function(){
  var burger=document.getElementById('navBurger');
  var links=document.querySelector('.nav-links');
  if(!burger||!links)return;
  burger.addEventListener('click',function(){
    burger.classList.toggle('open');
    links.classList.toggle('open');
    document.body.style.overflow=links.classList.contains('open')?'hidden':'';
  });
  links.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click',function(){
      burger.classList.remove('open');
      links.classList.remove('open');
      document.body.style.overflow='';
    });
  });
})();`;

// New mobile nav JS block
const NEW_NAV_JS = `// Mobile nav
(function(){
  var burger=document.getElementById('navBurger');
  var navList=document.querySelector('.nav-links');
  if(!burger||!navList)return;

  // Build overlay as direct body child — avoids nav containing-block trap
  var ov=document.createElement('div');
  ov.id='mobileMenuOv';
  ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:#02020a;z-index:99999;display:none;flex-direction:column;align-items:center;justify-content:center;gap:0;opacity:0;transition:opacity .3s ease';
  var ul=document.createElement('ul');
  ul.style.cssText='list-style:none;padding:0;margin:0;display:flex;flex-direction:column;align-items:center;gap:32px';
  navList.querySelectorAll('a').forEach(function(a){
    var li=document.createElement('li');
    var clone=a.cloneNode(true);
    clone.style.cssText='font-size:16px;letter-spacing:3px;text-transform:uppercase;color:rgba(238,238,248,.85);text-decoration:none;font-family:inherit;font-weight:400;transition:color .2s';
    clone.addEventListener('mouseenter',function(){this.style.color='#f0c84a'});
    clone.addEventListener('mouseleave',function(){this.style.color='rgba(238,238,248,.85)'});
    clone.addEventListener('click',closeMenu);
    li.appendChild(clone);
    ul.appendChild(li);
  });
  ov.appendChild(ul);
  document.body.appendChild(ov);

  function openMenu(){
    ov.style.display='flex';
    requestAnimationFrame(function(){ov.style.opacity='1';});
    burger.classList.add('open');
    document.body.style.overflow='hidden';
  }
  function closeMenu(){
    ov.style.opacity='0';
    setTimeout(function(){ov.style.display='none';},300);
    burger.classList.remove('open');
    document.body.style.overflow='';
  }
  burger.addEventListener('click',function(){
    ov.style.display==='none'||ov.style.display===''?openMenu():closeMenu();
  });
})();`;

// Old .nav-links mobile CSS block (the multi-line version with position:fixed)
// We need to match the block and replace with just display:none!important
// The pattern covers the .nav-links { ... } block plus the .nav-links.open and .nav-links a lines

// Two variant patterns seen across the pages:
// Variant A (index, pricing, faq): includes .nav-links.open and .nav-links a lines
const OLD_CSS_A = `  .nav-links{
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:#02020a;
    flex-direction:column;align-items:center;justify-content:center;
    gap:36px;z-index:9999;list-style:none;
    opacity:0;pointer-events:none;transform:translateY(-12px);
    transition:opacity .35s cubic-bezier(.23,1,.32,1),transform .35s cubic-bezier(.23,1,.32,1);
    display:flex!important;
  }
  .nav-links.open{opacity:1;pointer-events:all;transform:translateY(0)}
  .nav-links a{font-size:14px;letter-spacing:3px}`;

const NEW_CSS = `  .nav-links{display:none!important}`;

const pages = ['index.html', 'pricing.html', 'faq.html', 'terms.html', 'privacy.html'];

pages.forEach(function(p) {
  const path = 'C:/Users/Sheil/Downloads/DEALERPOST NEW WS/' + p;
  let pg = fs.readFileSync(path, 'utf8');

  // Fix mobile nav JS
  let updated = pg.replace(OLD_NAV_JS, NEW_NAV_JS);
  if (updated === pg) {
    console.log(p + ': WARNING - mobile nav JS not replaced (no match)');
  } else {
    console.log(p + ': mobile nav JS replaced');
  }

  // Fix mobile CSS
  let updated2 = updated.replace(OLD_CSS_A, NEW_CSS);
  if (updated2 === updated) {
    console.log(p + ': WARNING - mobile nav CSS not replaced (no match)');
  } else {
    console.log(p + ': mobile nav CSS replaced');
  }

  fs.writeFileSync(path, updated2, 'utf8');
});

console.log('Done.');
