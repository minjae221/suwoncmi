(() => {
  const pathname = window.location.pathname;
  const isEn = pathname.includes('/en/');
  const lang = isEn ? 'en' : 'ko';
  const base = isEn ? '../' : './';
  const page = pathname.endsWith('/') ? 'index.html' : pathname.split('/').pop();

  const fallbackCommunityImage = 'assets/img/community/placeholder-1.svg';
  const fallbackStaffImage = 'assets/img/staff/placeholder.svg';
  const fallbackLocationImage = 'assets/img/location/placeholder.svg';
  const defaultLocationMapImages = [
    'assets/img/location/naver-map.png',
    'assets/img/location/naver-map.jpg',
    'assets/img/location/naver-map.jpeg',
    'assets/img/location/naver-map.webp',
    'assets/img/location/naver-map.svg'
  ];

  const loadPartial = async (selector, path) => {
    const target = document.querySelector(selector);
    if (!target) return;
    try {
      const res = await fetch(path, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load partial');
      target.innerHTML = await res.text();
    } catch (err) {
      console.error(err);
    }
  };

  const setLanguageLinks = () => {
    const koLink = document.querySelector('[data-lang="ko"]');
    const enLink = document.querySelector('[data-lang="en"]');
    if (koLink) {
      koLink.href = isEn ? `../${page}` : `./${page}`;
      koLink.classList.toggle('active', !isEn);
    }
    if (enLink) {
      enLink.href = isEn ? `./${page}` : `en/${page}`;
      enLink.classList.toggle('active', isEn);
    }

    const normalizePage = (href = '') => {
      const clean = href.split('#')[0].split('?')[0];
      if (!clean || clean.endsWith('/')) return 'index.html';
      const file = clean.split('/').pop();
      return file || 'index.html';
    };

    const currentPage = normalizePage(page);
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      link.removeAttribute('aria-current');
      if (normalizePage(href) === currentPage) link.setAttribute('aria-current', 'page');
    });
  };

  const resolveAsset = (src, fallback = '') => {
    const value = src || fallback;
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) return value;
    return base + value.replace(/^\.\//, '');
  };

  const setImageSourceWithFallbacks = (img, candidates = []) => {
    const queue = [...new Set(candidates.map((src) => resolveAsset(src)).filter(Boolean))];
    if (!queue.length) return;

    const tryNext = () => {
      const next = queue.shift();
      if (!next) {
        img.onerror = null;
        return;
      }
      img.src = next;
    };

    img.onerror = tryNext;
    tryNext();
  };

  const getImageCandidates = (...sources) => {
    const exts = ['png', 'jpg', 'jpeg', 'webp', 'svg'];
    const out = [];
    const seen = new Set();

    const push = (value) => {
      if (!value || seen.has(value)) return;
      seen.add(value);
      out.push(value);
    };

    const addWithVariants = (src) => {
      if (!src) return;
      push(src);
      if (/^(https?:\/\/|\/)/i.test(src)) return;

      const match = src.match(/^(.*)\.(png|jpg|jpeg|webp|svg)$/i);
      if (!match) return;

      const basePath = match[1];
      exts.forEach((ext) => push(`${basePath}.${ext}`));
    };

    sources.forEach(addWithVariants);
    return out;
  };

  const createEl = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text === 'string') el.textContent = text;
    return el;
  };

  const getLocaleText = (value) => {
    if (typeof value === 'string') return value;
    return (
      value?.[lang] ||
      value?.ko ||
      value?.kr ||
      value?.en ||
      value?.eng ||
      value?.english ||
      value?.KO ||
      value?.EN ||
      ''
    );
  };

  const toIsoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentWeekSunday = () => {
    const today = new Date();
    const sunday = new Date(today);
    const daysUntilSunday = (7 - today.getDay()) % 7;
    sunday.setDate(today.getDate() + daysUntilSunday);
    return sunday;
  };

  const getKoWeekLabel = (weekNumber) => {
    const labels = ['', '첫째', '둘째', '셋째', '넷째', '다섯째'];
    return labels[weekNumber] || `${weekNumber}째`;
  };

  const getEnWeekLabel = (weekNumber) => {
    const labels = ['', 'First', 'Second', 'Third', 'Fourth', 'Fifth'];
    return labels[weekNumber] || `${weekNumber}th`;
  };

  const buildWeeklyWorshipNoticeTitle = (sunday = getCurrentWeekSunday()) => {
    const monthNumber = sunday.getMonth() + 1;
    const weekNumber = Math.ceil(sunday.getDate() / 7);

    const monthName = sunday.toLocaleString('en-US', { month: 'long' });
    return {
      ko: `${monthNumber}월 ${getKoWeekLabel(weekNumber)} 주 예배 안내`,
      en: `Worship Schedule for the ${getEnWeekLabel(weekNumber)} Week of ${monthName}`
    };
  };

  const shouldAutoWeeklyWorshipNotice = (notice = {}) => {
    if (notice.autoWeeklyWorshipTitle === true) return true;
    const koTitle = notice.title?.ko || '';
    const enTitle = notice.title?.en || '';
    return /주\s*예배\s*안내$/.test(koTitle) || /Worship Schedule/i.test(enTitle);
  };

  const buildMapUrl = (locationData = {}) => {
    const direct = getLocaleText(locationData.mapUrl)?.trim();
    if (direct) return direct;

    const provider = (locationData.mapProvider || '').toLowerCase();
    const query = getLocaleText(locationData.naverSearchQuery).trim();

    if (provider === 'naver' && query) {
      return `https://map.naver.com/v5/search/${encodeURIComponent(query)}`;
    }
    return '#';
  };

  const setBrandLogo = () => {
    const logos = document.querySelectorAll('.brand-logo');
    logos.forEach((img) => {
      const placeholderSrc = img.dataset.logoPlaceholder || 'assets/img/logo-placeholder.svg';
      setImageSourceWithFallbacks(img, [
        img.dataset.logoSrc,
        'assets/img/logo.png',
        'assets/img/logo.jpg',
        'assets/img/logo.jpeg',
        'assets/img/logo.webp',
        'assets/img/logo.svg',
        placeholderSrc
      ]);
    });
  };

  const renderWorshipCards = (container, worshipTimes = []) => {
    if (!container) return;
    container.innerHTML = '';

    worshipTimes.forEach((item) => {
      const card = createEl('article', 'card');
      const title = createEl('h3', null, getLocaleText(item.label));
      const time = createEl('p', null, getLocaleText(item.time));
      card.append(title, time);
      container.append(card);
    });
  };

  const renderNotices = (notices, limit) => {
    const list = document.querySelector('#notices-list') || document.querySelector('#notices-preview');
    if (!list) return;
    list.innerHTML = '';
    const currentWeekSunday = getCurrentWeekSunday();
    const weeklyWorshipTitle = buildWeeklyWorshipNoticeTitle(currentWeekSunday);

    const sorted = [...notices].sort((a, b) => new Date(b.date) - new Date(a.date));
    sorted.slice(0, limit || sorted.length).forEach((notice) => {
      const isWeeklyWorshipNotice = shouldAutoWeeklyWorshipNotice(notice);
      const noticeTitle = isWeeklyWorshipNotice ? weeklyWorshipTitle : notice.title;
      const noticeDate = isWeeklyWorshipNotice ? toIsoDate(currentWeekSunday) : notice.date;

      const item = createEl('article', 'notice-item');
      const title = createEl('h3', null, getLocaleText(noticeTitle));
      const meta = createEl('div', 'notice-meta', noticeDate || '');
      const body = createEl('p', null, getLocaleText(notice.body));
      item.append(title, meta, body);

      if (notice.link) {
        const link = createEl('a', 'button secondary', isEn ? 'Read more' : '자세히 보기');
        link.href = notice.link;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        item.append(link);
      }
      list.append(item);
    });
  };

  const renderCommunity = (community, limit, showAllImages = false, communityLink = '') => {
    const grid = document.querySelector('#community-grid') || document.querySelector('#community-preview');
    if (!grid) return;
    grid.innerHTML = '';

    const sorted = [...community].sort((a, b) => new Date(b.date) - new Date(a.date));
    sorted.slice(0, limit || sorted.length).forEach((post) => {
      const card = createEl('article', 'card community-card');
      const images = post.images?.length ? post.images : [{ src: fallbackCommunityImage, alt: { [lang]: '' } }];

      if (showAllImages) {
        const gallery = createEl('div', 'card-grid');
        images.forEach((image) => {
          const img = document.createElement('img');
          img.alt = getLocaleText(image.alt);
          setImageSourceWithFallbacks(img, getImageCandidates(image.src, fallbackCommunityImage));

          if (communityLink) {
            const anchor = document.createElement('a');
            anchor.href = communityLink;
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
            anchor.append(img);
            gallery.append(anchor);
          } else {
            gallery.append(img);
          }
        });
        card.append(gallery);
      } else {
        const img = document.createElement('img');
        img.alt = getLocaleText(images[0].alt);
        setImageSourceWithFallbacks(img, getImageCandidates(images[0].src, fallbackCommunityImage));

        if (communityLink) {
          const anchor = document.createElement('a');
          anchor.href = communityLink;
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
          anchor.append(img);
          card.append(anchor);
        } else {
          card.append(img);
        }
      }

      const title = createEl('h3', null, getLocaleText(post.title));
      const meta = createEl('div', 'notice-meta', post.date || '');
      const desc = createEl('p', null, getLocaleText(post.desc));
      card.append(title, meta, desc);
      grid.append(card);
    });
  };

  const renderStaff = (staff) => {
    const grid = document.querySelector('#staff-grid');
    if (!grid) return;
    grid.innerHTML = '';

    staff.forEach((member) => {
      const card = createEl('article', 'card staff-card');
      const img = document.createElement('img');
      img.src = resolveAsset(getLocaleText(member.photo), fallbackStaffImage);
      img.alt = getLocaleText(member.name);
      img.onerror = () => {
        img.src = resolveAsset(fallbackStaffImage);
        img.onerror = null;
      };
      const role = createEl('div', 'notice-meta', getLocaleText(member.role));
      const name = createEl('h3', null, getLocaleText(member.name));
      const bio = createEl('p', 'staff-bio', getLocaleText(member.bio));
      card.append(img, role, name, bio);
      grid.append(card);
    });
  };

  const renderAbout = (about) => {
    const container = document.querySelector('#about-sections');
    if (!container) return;
    container.innerHTML = '';

    (about.sections || []).forEach((section) => {
      const card = createEl('article', 'about-section');
      const title = createEl('h3', null, getLocaleText(section.title));
      card.append(title);

      const subtitleText = getLocaleText(section.subtitle);
      if (subtitleText) {
        const subtitle = createEl('p', 'notice-meta', subtitleText);
        card.append(subtitle);
      }

      (section.paragraphs?.[lang] || []).forEach((para) => {
        const p = createEl('p', null, para);
        card.append(p);
      });
      container.append(card);
    });
  };

  const renderGlobalSite = (data) => {
    const site = data.site || {};
    const worshipTimes = data.worshipTimes || [];
    const churchName = getLocaleText(site.churchName) || (isEn ? 'Suwoncmi' : '수원선교교회');
    const denomination = getLocaleText(site.denomination);
    const address = getLocaleText(site.address);
    const tel = site.tel || '';

    document.querySelectorAll('[data-site-church-name]').forEach((el) => {
      el.textContent = churchName;
    });

    document.querySelectorAll('.brand-logo').forEach((img) => {
      img.alt = isEn ? `${churchName} logo` : `${churchName} 로고`;
    });

    if (document.title.includes('|')) {
      const suffix = document.title.split('|').slice(1).join('|').trim();
      document.title = `${churchName} | ${suffix}`;
    }

    const footerSite = document.querySelector('[data-footer-site]');
    if (footerSite) {
      footerSite.innerHTML = '';
      const nameLine = createEl('p');
      const strong = createEl('strong', null, churchName);
      nameLine.append(strong);
      if (denomination) {
        nameLine.append(document.createTextNode(` (${denomination})`));
      }
      const addressLine = createEl('p', null, address);
      const telLine = createEl('p');
      telLine.textContent = isEn ? 'Tel: ' : '전화: ';
      const telLink = createEl('a', null, tel);
      telLink.href = `tel:${tel}`;
      telLine.append(telLink);
      footerSite.append(nameLine, addressLine, telLine);
    }

    const footerWorship = document.querySelector('[data-footer-worship]');
    if (footerWorship) {
      footerWorship.innerHTML = '';
      worshipTimes.forEach((item) => {
        const row = createEl('p', null, `${getLocaleText(item.label)}: ${getLocaleText(item.time)}`);
        footerWorship.append(row);
      });
    }

    const copyright = document.querySelector('[data-footer-copyright]');
    if (copyright) {
      copyright.textContent = `© ${new Date().getFullYear()} ${churchName}`;
    }

    const telTargets = ['#home-location-tel', '#location-tel', '#newcomers-tel'];
    telTargets.forEach((selector) => {
      const link = document.querySelector(selector);
      if (!link || !tel) return;
      link.href = `tel:${tel}`;
      link.textContent = tel;
    });
  };

  const renderLinks = (data) => {
    const links = data.site?.links || {};

    const communityInstagram = document.querySelector('#community-instagram-link');
    if (communityInstagram) {
      if (links.instagram) communityInstagram.href = links.instagram;
      communityInstagram.textContent = links.instagramHandle || '@su1.mission_youth';
    }

    const homeInstagram = document.querySelector('#home-community-instagram-link');
    if (homeInstagram) {
      if (links.instagram) homeInstagram.href = links.instagram;
      homeInstagram.textContent = 'Instagram';
    }

    const youtubeLink = document.querySelector('#sermons-youtube-link');
    if (youtubeLink && links.youtube) {
      youtubeLink.href = links.youtube;
    }
  };

  const renderHome = (data) => {
    const hero = data.hero || {};
    const address = getLocaleText(data.site?.address);

    const heroHeadline = document.querySelector('#home-hero-headline');
    if (heroHeadline) heroHeadline.textContent = getLocaleText(hero.headline);

    const heroSub = document.querySelector('#home-hero-sub');
    if (heroSub) heroSub.textContent = getLocaleText(hero.sub);

    const heroCta = document.querySelector('#home-hero-cta');
    if (heroCta) heroCta.textContent = getLocaleText(hero.cta);

    const addressNode = document.querySelector('#home-location-address');
    if (addressNode) addressNode.textContent = address;

    const worshipGrid = document.querySelector('#home-worship-grid');
    renderWorshipCards(worshipGrid, data.worshipTimes || []);
  };

  const renderLocation = (data) => {
    const address = getLocaleText(data.site?.address);
    const mapUrl = buildMapUrl(data.location || {});
    const mapImage = data.location?.mapImage || {};

    const addressNode = document.querySelector('#location-address');
    if (addressNode) addressNode.textContent = address;

    document.querySelectorAll('[data-map-link]').forEach((anchor) => {
      anchor.href = mapUrl;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    });

    const thumbLink = document.querySelector('#location-map-thumb-link');
    const thumbImg = document.querySelector('#location-map-thumb');
    if (thumbLink) {
      thumbLink.href = mapUrl;
      thumbLink.target = '_blank';
      thumbLink.rel = 'noopener noreferrer';
    }
    if (thumbImg) {
      thumbImg.alt = getLocaleText(mapImage.alt) || (isEn ? 'Naver Map location' : '네이버지도 위치');
      setImageSourceWithFallbacks(thumbImg, [mapImage.src, ...defaultLocationMapImages, fallbackLocationImage]);
    }
  };

  const initData = async () => {
    try {
      const res = await fetch(base + 'data/work.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load data');
      const data = await res.json();
      const pageId = document.body?.dataset?.page;

      renderGlobalSite(data);
      renderLinks(data);
      renderLocation(data);

      if (pageId === 'home') {
        renderHome(data);
        renderNotices(data.notices || [], 3);
        renderCommunity(data.community || [], 2, false, data.site?.links?.instagram || '');
      }
      if (pageId === 'notice') {
        renderNotices(data.notices || []);
      }
      if (pageId === 'community') {
        renderCommunity(data.community || [], undefined, true, data.site?.links?.instagram || '');
      }
      if (pageId === 'staff') {
        renderStaff(data.staff || []);
      }
      if (pageId === 'about') {
        renderAbout(data.about || { sections: [] });
      }
      if (pageId === 'worship') {
        const worshipGrid = document.querySelector('#worship-times-grid');
        renderWorshipCards(worshipGrid, data.worshipTimes || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const initReveal = () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = document.querySelectorAll(
      '.hero, .hero-lite, .section, .section-title, .card-grid, .card, .about-section, .location-box, .location-map-media, .cta-large, .notice-item, .site-footer'
    );
    targets.forEach((el) => el.classList.add('reveal'));

    if (prefersReduced) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    targets.forEach((el) => observer.observe(el));
  };

  const init = async () => {
    await loadPartial('#site-header', base + `partials/header.${isEn ? 'en' : 'ko'}.html`);
    await loadPartial('#site-footer', base + `partials/footer.${isEn ? 'en' : 'ko'}.html`);
    setLanguageLinks();
    setBrandLogo();
    await initData();
    initReveal();
  };

  init();
})();
