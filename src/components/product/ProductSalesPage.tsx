import React, { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  BookOpenCheck,
  Braces,
  Check,
  ChevronDown,
  CirclePlay,
  Code2,
  Compass,
  Download,
  GraduationCap,
  Layers3,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Play,
  Puzzle,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UsersRound,
  Video,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import "./product-sales.css";

const pageTitle =
  "Lumina Learn | پلتفرم فروش دوره آموزشی Full-Stack با React و TypeScript";
const pageDescription =
  "پلتفرم آموزشی مدرن، سریع و قابل توسعه برای فروش دوره و محصولات دیجیتال آموزشی؛ با پنل مدیریت و مدرس و رابط فارسی و راست‌چین.";

const features = [
  {
    icon: BookOpenCheck,
    number: "۰۱",
    title: "تجربهٔ یادگیری، نه فقط فهرست دوره",
    text: "از کشف دوره تا صفحهٔ درس، محتوای ویدیویی، متنی و فایل‌های آموزشی؛ مسیر یادگیری با آزمون، یادداشت و پیگیری پیشرفت در یک محصول پیوسته شده است.",
    tags: ["کاتالوگ و جست‌وجو", "آزمون و تکلیف", "پیشرفت و گواهی"],
  },
  {
    icon: Layers3,
    number: "۰۲",
    title: "مدیریت دوره در کنار تجربهٔ مدرس",
    text: "مدرس می‌تواند محتوای آموزشی را بسازد و مدیریت کند؛ مدیر نیز ابزارهای جداگانه برای دوره‌ها، کاربران و تنظیمات سایت در اختیار دارد.",
    tags: ["پنل مدرس", "مدیریت دوره", "نقش‌های کاربری"],
  },
  {
    icon: ShoppingBag,
    number: "۰۳",
    title: "لایهٔ فروش برای محتوای آموزشی",
    text: "سبد خرید، کد تخفیف، عضویت ویژه و مسیرهای تجارت در معماری موجودند؛ اتصال درگاه واقعی با تنظیمات محیط انتشار تکمیل می‌شود.",
    tags: ["سبد خرید", "کد تخفیف", "درگاه قابل پیکربندی"],
  },
];

const faqs = [
  {
    question: "چه چیزی همراه محصول ارائه می‌شود؟",
    answer:
      "این صفحه نسخهٔ نرم‌افزاری Lumina Learn را معرفی می‌کند: رابط کاربری React و TypeScript، سرور Express، تجربهٔ دوره و درس، و ابزارهای دانشجو، مدرس و مدیر. شرایط لایسنس، فایل‌های خرید و پشتیبانی را مطابق فهرست محصول در مارکت بررسی کنید.",
  },
  {
    question: "آیا پرداخت آنلاین از ابتدا فعال است؟",
    answer:
      "مسیرهای فروش و پرداخت در کد محصول وجود دارند، اما فعال‌سازی درگاه واقعی به انتخاب ارائه‌دهنده، مقادیر محیطی و دسترسی فروشنده نیاز دارد. پیش از دریافت پرداخت، تنظیمات درگاه و محیط انتشار خود را تکمیل کنید.",
  },
  {
    question: "برای نصب به چه چیزی نیاز دارم؟",
    answer:
      "یک محیط اجرای Node.js و دسترسی به کد پروژه لازم است. متغیرهای موردنیاز را از روی فایل .env.example تنظیم کنید؛ سپس وابستگی‌ها را نصب، نسخهٔ نهایی را build و سرور را اجرا کنید.",
  },
  {
    question: "آیا می‌توان ظاهر و رفتار محصول را تغییر داد؟",
    answer:
      "بله. ساختار React و TypeScript برای تغییر رابط، اجزای دوره، تجربهٔ نقش‌های کاربری و منطق سرویس‌ها در اختیار توسعه‌دهنده است. برای اتصال‌ها و سفارشی‌سازی‌های وابسته به سرویس، مقدارهای محیطی همان سرویس را نیز تنظیم کنید.",
  },
];

const installSteps = [
  { number: "۱", title: "آماده‌سازی محیط", code: "Node.js  ·  npm" },
  { number: "۲", title: "نصب وابستگی‌ها", code: "npm install" },
  { number: "۳", title: "تنظیم متغیرها", code: "cp .env.example .env" },
  { number: "۴", title: "ساخت و اجرا", code: "npm run build  →  npm start" },
];

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <span
      className={`ll-mark${light ? " ll-mark--light" : ""}`}
      aria-hidden="true"
    >
      <span className="ll-mark__page ll-mark__page--back" />
      <span className="ll-mark__page ll-mark__page--front">
        <Sparkles size={13} strokeWidth={2.3} />
      </span>
    </span>
  );
}

function DashboardPreview() {
  return (
    <div
      className="ll-device"
      aria-label="نمای نمونه از رابط مدیریت و یادگیری Lumina Learn"
    >
      <div className="ll-device__chrome" dir="ltr">
        <span />
        <span />
        <span />
        <div className="ll-device__address">lumina.learn / dashboard</div>
        <span className="ll-device__secure">
          <LockKeyhole size={10} />
        </span>
      </div>
      <div className="ll-dashboard" dir="rtl">
        <aside className="ll-dashboard__sidebar">
          <div className="ll-dashboard__brand">
            <BrandMark light />
            <span>Lumina Learn</span>
          </div>
          <span className="ll-dashboard__section-label">فضای مدیریت</span>
          <div className="ll-dashboard__nav ll-dashboard__nav--active">
            <Layers3 size={15} /> نمای کلی
          </div>
          <div className="ll-dashboard__nav">
            <BookOpenCheck size={15} /> دوره‌ها
          </div>
          <div className="ll-dashboard__nav">
            <UsersRound size={15} /> کاربران
          </div>
          <div className="ll-dashboard__nav">
            <Video size={15} /> کتابخانهٔ رسانه
          </div>
          <div className="ll-dashboard__sidebar-foot">
            <span className="ll-status-dot" /> سامانه آمادهٔ مدیریت
          </div>
        </aside>
        <div className="ll-dashboard__main">
          <div className="ll-dashboard__topline">
            <div>
              <span className="ll-dashboard__eyebrow">پیشخوان مدیر</span>
              <h3>نمای کلی سامانه</h3>
            </div>
            <div className="ll-dashboard__avatar">م</div>
          </div>
          <div className="ll-dashboard__welcome">
            <div>
              <span>Lumina Learn</span>
              <strong>همه‌چیز برای آموزش، یک‌جا.</strong>
              <small>دوره‌ها، مدرس‌ها و تجربهٔ دانشجو را مدیریت کنید.</small>
            </div>
            <div className="ll-orbit">
              <GraduationCap size={27} />
            </div>
          </div>
          <div className="ll-dashboard__metrics">
            <div>
              <span>مدیریت محتوا</span>
              <strong>
                <BookOpenCheck size={15} /> دوره و درس
              </strong>
              <small>ساختارمند و قابل ویرایش</small>
            </div>
            <div>
              <span>نقش‌های سامانه</span>
              <strong>
                <UsersRound size={15} /> دانشجو · مدرس · مدیر
              </strong>
              <small>هر نقش، فضای کاری خود را دارد</small>
            </div>
          </div>
          <div className="ll-dashboard__course">
            <div className="ll-dashboard__course-art">
              <span>دورهٔ نمونه</span>
              <div className="ll-course-shape">
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="ll-dashboard__course-info">
              <span>تجربهٔ یادگیری</span>
              <strong>از کاتالوگ تا آخرین درس</strong>
              <div className="ll-dashboard__progress">
                <i />
              </div>
              <small>نمایشی از پیشرفت دوره</small>
            </div>
          </div>
          <div className="ll-dashboard__footer">
            <span>
              <Check size={13} /> رابط فارسی و راست‌چین
            </span>
            <span>پیش‌نمایش رابط محصول</span>
          </div>
        </div>
      </div>
      <div className="ll-float-note ll-float-note--top">
        <span className="ll-float-note__icon">
          <ShieldCheck size={16} />
        </span>
        <span>
          <strong>سه فضای کاری</strong>
          <small>دانشجو، مدرس و مدیر</small>
        </span>
      </div>
      <div className="ll-float-note ll-float-note--bottom">
        <span className="ll-float-note__icon ll-float-note__icon--mint">
          <Code2 size={16} />
        </span>
        <span>
          <strong>سورس قابل توسعه</strong>
          <small>React · TypeScript · Express</small>
        </span>
      </div>
    </div>
  );
}

export const ProductSalesPage: React.FC = () => {
  const { navigate } = useApp();
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const marketplaceCandidate = (
    import.meta as ImportMeta & { env?: Record<string, string | undefined> }
  ).env?.VITE_MARKETPLACE_URL?.trim();
  const marketplaceUrl =
    marketplaceCandidate && /^https?:\/\//i.test(marketplaceCandidate)
      ? marketplaceCandidate
      : undefined;

  useEffect(() => {
    const previousTitle = document.title;
    const descriptionMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const previousDescription = descriptionMeta?.content;
    document.title = pageTitle;
    if (descriptionMeta) descriptionMeta.content = pageDescription;
    return () => {
      document.title = previousTitle;
      if (descriptionMeta && previousDescription)
        descriptionMeta.content = previousDescription;
    };
  }, []);

  const goToDemo = () => navigate("home");
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="lumina-sales" dir="rtl">
      <a className="ll-skip-link" href="#main-content">
        رفتن به محتوای اصلی
      </a>
      <header className="ll-header">
        <div className="ll-header__inner">
          <a
            className="ll-brand"
            href="#top"
            aria-label="Lumina Learn، رفتن به ابتدای صفحه"
          >
            <BrandMark />
            <span className="ll-brand__word">
              <strong>Lumina Learn</strong>
              <small>سامانهٔ یادگیری آنلاین</small>
            </span>
          </a>
          <button
            className="ll-menu-toggle"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "بستن منو" : "بازکردن منو"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav
            className={`ll-nav${menuOpen ? " ll-nav--open" : ""}`}
            aria-label="ناوبری صفحهٔ محصول"
          >
            <a href="#capabilities" onClick={closeMenu}>
              قابلیت‌ها
            </a>
            <a href="#technology" onClick={closeMenu}>
              فناوری
            </a>
            <a href="#setup" onClick={closeMenu}>
              راه‌اندازی
            </a>
            <a href="#faq" onClick={closeMenu}>
              پرسش‌های رایج
            </a>
            <a href="#purchase" className="ll-nav__cta" onClick={closeMenu}>
              اطلاعات خرید <ArrowLeft size={15} />
            </a>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className="ll-hero" id="top">
          <div className="ll-hero__texture" aria-hidden="true" />
          <div className="ll-shell ll-hero__layout">
            <div className="ll-hero__copy">
              <div className="ll-eyebrow">
                <span className="ll-eyebrow__spark">
                  <Sparkles size={13} />
                </span>{" "}
                پلتفرم آموزشی Full-Stack · رابط کاملاً فارسی
              </div>
              <h1>
                برای آموزش،
                <br />
                <em>زیرساختِ خودتان.</em>
              </h1>
              <p className="ll-hero__lead">
                لومینا لرن یک پلتفرم آموزشی مدرن، سریع و قابل توسعه برای فروش
                دوره و محصولات دیجیتال آموزشی، مدیریت محتوا و آموزش آنلاین است؛
                با رابط فارسی و RTL و کدی که برای رشد محصول در اختیار شماست.
              </p>
              <div className="ll-hero__actions">
                <button
                  className="ll-button ll-button--primary"
                  onClick={goToDemo}
                >
                  مشاهدهٔ دموی سامانه <ArrowLeft size={17} />
                </button>
                <a className="ll-button ll-button--quiet" href="#capabilities">
                  کشف قابلیت‌ها <ArrowDownLeft size={17} />
                </a>
              </div>
              <div className="ll-proof-row">
                <div className="ll-proof">
                  <span className="ll-proof__icon">
                    <UsersRound size={16} />
                  </span>
                  <span>
                    <strong>سه نقش اصلی</strong>
                    <small>دانشجو، مدرس، مدیر</small>
                  </span>
                </div>
                <span className="ll-proof-divider" />
                <div className="ll-proof">
                  <span className="ll-proof__icon">
                    <Braces size={16} />
                  </span>
                  <span>
                    <strong>سورس Full-Stack</strong>
                    <small>رابط و سرور مستقل</small>
                  </span>
                </div>
                <span className="ll-proof-divider" />
                <div className="ll-proof">
                  <span className="ll-proof__icon">
                    <Compass size={16} />
                  </span>
                  <span>
                    <strong>فارسی و RTL</strong>
                    <small>آمادهٔ مخاطب ایرانی</small>
                  </span>
                </div>
              </div>
            </div>
            <div className="ll-hero__visual">
              <DashboardPreview />
              <span className="ll-hero__caption">
                <span /> تصویری از رابط محصول · پیش‌نمایش رابط
              </span>
            </div>
          </div>
          <div className="ll-hero__bottomline">
            <span>محصول آموزشی قابل شخصی‌سازی</span>
            <span className="ll-hero__bottomline-rule" />
            <span>معماری React + TypeScript + Express</span>
          </div>
        </section>

        <section className="ll-intro-band" aria-label="معرفی محصول">
          <div className="ll-shell ll-intro-band__inner">
            <span className="ll-intro-band__label">
              یک محصول کامل،
              <br />
              از کلاس تا مدیریت
            </span>
            <p>
              از اولین بازدیدِ کاتالوگ تا پیگیری یادگیری و مدیریت محتوا، Lumina
              Learn اجزای اصلی یک کسب‌وکار آموزشی را در تجربه‌ای یکپارچه کنار هم
              می‌آورد.
            </p>
            <a href="#capabilities" className="ll-text-link">
              ببینید چه چیزی درون محصول است <ArrowUpLeft size={17} />
            </a>
          </div>
        </section>

        <section className="ll-section ll-capabilities" id="capabilities">
          <div className="ll-shell">
            <div className="ll-section-heading">
              <div>
                <span className="ll-kicker">آنچه واقعاً در محصول هست</span>
                <h2>فروش دوره، با پشتوانهٔ یک سامانه</h2>
              </div>
              <p>
                نه یک قالب نمایشیِ تنها؛ مجموعه‌ای از تجربه‌های آموزشی و
                ابزارهای مدیریتی که در سورس محصول حضور دارند.
              </p>
            </div>
            <div className="ll-feature-list">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article className="ll-feature-row" key={feature.number}>
                    <div className="ll-feature-row__mark">
                      <Icon size={21} strokeWidth={1.7} />
                      <span>{feature.number}</span>
                    </div>
                    <div className="ll-feature-row__body">
                      <h3>{feature.title}</h3>
                      <p>{feature.text}</p>
                      <div className="ll-tags">
                        {feature.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <ArrowUpLeft className="ll-feature-row__arrow" size={19} />
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="ll-section ll-workspaces" id="workspaces">
          <div className="ll-shell ll-workspaces__layout">
            <div className="ll-workspaces__intro">
              <span className="ll-kicker">یک پلتفرم، سه دیدگاه</span>
              <h2>
                هر نقش،
                <br />
                جای خودش را دارد.
              </h2>
              <p>
                پلتفرم نقش‌های کاربری متمایز دارد تا تجربهٔ یادگیری، آموزش و
                مدیریت از هم جدا اما در یک محصول هماهنگ بمانند.
              </p>
              <button
                className="ll-text-link ll-text-link--button"
                onClick={goToDemo}
              >
                ورود به دموی سامانه <ArrowLeft size={17} />
              </button>
            </div>
            <div className="ll-role-grid">
              <article className="ll-role-card ll-role-card--student">
                <div className="ll-role-card__icon">
                  <GraduationCap size={20} />
                </div>
                <span className="ll-kicker">فضای فراگیر</span>
                <h3>برای دانشجو</h3>
                <p>
                  دوره‌ها را پیدا کنید، درس‌ها را دنبال کنید و پیشرفت یادگیری را
                  ثبت کنید.
                </p>
                <div className="ll-role-card__detail">
                  <span>کاتالوگ دوره</span>
                  <span>پخش درس</span>
                  <span>پیشرفت و یادداشت</span>
                </div>
                <span className="ll-role-card__number">۰۱</span>
              </article>
              <article className="ll-role-card ll-role-card--instructor">
                <div className="ll-role-card__icon">
                  <BookOpenCheck size={20} />
                </div>
                <span className="ll-kicker">فضای تولید</span>
                <h3>برای مدرس</h3>
                <p>
                  محتوای دوره را بسازید و اطلاعات و وضعیت انتشار آموزش‌ها را
                  مدیریت کنید.
                </p>
                <div className="ll-role-card__detail">
                  <span>ساخت دوره</span>
                  <span>درس و محتوا</span>
                  <span>مدیریت دوره‌ها</span>
                </div>
                <span className="ll-role-card__number">۰۲</span>
              </article>
              <article className="ll-role-card ll-role-card--admin">
                <div className="ll-role-card__icon">
                  <ShieldCheck size={20} />
                </div>
                <span className="ll-kicker">فضای راهبری</span>
                <h3>برای مدیر</h3>
                <p>
                  به ابزارهای مدیریت کاربران، دوره‌ها، رسانه و تنظیمات سامانه
                  دسترسی داشته باشید.
                </p>
                <div className="ll-role-card__detail">
                  <span>پیشخوان مدیریت</span>
                  <span>کاربران و نقش‌ها</span>
                  <span>کتابخانهٔ رسانه</span>
                </div>
                <span className="ll-role-card__number">۰۳</span>
              </article>
            </div>
          </div>
        </section>

        <section className="ll-section ll-learning" id="learning">
          <div className="ll-shell ll-learning__layout">
            <div className="ll-learning__visual">
              <div className="ll-player-card">
                <div className="ll-player-card__top">
                  <span>
                    <BookOpenCheck size={15} /> مسیر یادگیری
                  </span>
                  <span className="ll-player-card__counter">نمونهٔ رابط</span>
                </div>
                <div className="ll-player-card__screen">
                  <div className="ll-player-card__screen-glow" />
                  <div className="ll-play-button">
                    <Play size={19} fill="currentColor" />
                  </div>
                  <span className="ll-player-card__screen-caption">
                    محتوای درس
                  </span>
                  <div className="ll-player-card__timeline">
                    <i />
                  </div>
                </div>
                <div className="ll-player-card__lesson">
                  <div>
                    <span>درس جاری</span>
                    <strong>یک مسیر روشن از مفهوم تا عمل</strong>
                  </div>
                  <span className="ll-player-card__check">
                    <Check size={15} />
                  </span>
                </div>
                <div className="ll-player-card__meta">
                  <span>
                    <MessageSquareText size={14} /> یادداشت‌های زمان‌دار
                  </span>
                  <span>
                    <Download size={14} /> منابع دوره
                  </span>
                </div>
              </div>
              <div className="ll-learning__stamp">
                <BadgeCheck size={15} /> یادگیری پیوسته
              </div>
            </div>
            <div className="ll-learning__copy">
              <span className="ll-kicker">تجربهٔ آموزشی</span>
              <h2>
                از یک درس تا
                <br />
                <em>ادامه‌دادنِ مسیر.</em>
              </h2>
              <p>
                محیط یادگیری برای محتواهای چندرسانه‌ای و پیگیری دوره طراحی شده؛
                با ابزارهایی که جریان مطالعه و بازگشت به درس را ساده‌تر می‌کنند.
              </p>
              <ul className="ll-check-list">
                <li>
                  <Check size={16} /> محتوای درس با قالب‌های متنوع در مدل آموزشی
                </li>
                <li>
                  <Check size={16} /> ثبت پیشرفت و تکمیل درس
                </li>
                <li>
                  <Check size={16} /> یادداشت‌های مرتبط با درس و زمان
                </li>
                <li>
                  <Check size={16} /> دوره، ماژول و درس در ساختاری قابل مدیریت
                </li>
              </ul>
              <button
                className="ll-button ll-button--outline"
                onClick={goToDemo}
              >
                دیدن فضای یادگیری <ArrowLeft size={16} />
              </button>
            </div>
          </div>
        </section>

        <section className="ll-section ll-technology" id="technology">
          <div className="ll-shell ll-technology__layout">
            <div className="ll-technology__copy">
              <span className="ll-kicker ll-kicker--light">
                زیرساختی برای توسعه
              </span>
              <h2>
                کدِ خوانا.
                <br />
                <em>مسیرهای باز.</em>
              </h2>
              <p>
                ساختار موجود، رابط کاربری و API سرور را کنار هم قرار می‌دهد؛
                برای تیمی که می‌خواهد محصول را مطابق مدل کسب‌وکار خودش ادامه
                دهد.
              </p>
              <a className="ll-button ll-button--dark" href="#setup">
                معماری و راه‌اندازی <ArrowLeft size={16} />
              </a>
            </div>
            <div className="ll-architecture" dir="ltr">
              <div className="ll-architecture__top">
                <span>ساختار فنی محصول</span>
                <span className="ll-architecture__live">
                  <i /> در سورس موجود
                </span>
              </div>
              <div className="ll-architecture__flow">
                <div className="ll-architecture__node ll-architecture__node--frontend">
                  <span className="ll-architecture__node-icon">
                    <Braces size={19} />
                  </span>
                  <div>
                    <strong>React 19</strong>
                    <small>رابط کاربری + TypeScript</small>
                  </div>
                  <span className="ll-architecture__node-tag">FRONTEND</span>
                </div>
                <div className="ll-architecture__connector">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="ll-architecture__node ll-architecture__node--api">
                  <span className="ll-architecture__node-icon">
                    <Puzzle size={18} />
                  </span>
                  <div>
                    <strong>Express API</strong>
                    <small>Node.js · مسیرهای سرویس</small>
                  </div>
                  <span className="ll-architecture__node-tag">SERVER</span>
                </div>
                <div className="ll-architecture__connector">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="ll-architecture__node ll-architecture__node--modules">
                  <span className="ll-architecture__node-icon">
                    <Layers3 size={18} />
                  </span>
                  <div>
                    <strong>ماژول‌های محصول</strong>
                    <small>کاربر · دوره · پیشرفت · فروش</small>
                  </div>
                  <span className="ll-architecture__node-tag">MODULES</span>
                </div>
              </div>
              <div className="ll-architecture__stack">
                <span>React</span>
                <span>TypeScript</span>
                <span>Vite</span>
                <span>Express</span>
                <span>REST API</span>
                <span>Node.js</span>
              </div>
            </div>
          </div>
          <div className="ll-shell ll-tech-note">
            <span>
              <LockKeyhole size={15} /> دربارهٔ امنیت و اتصال‌ها
            </span>
            <p>
              احراز هویت و کنترل نقش‌ها در کد محصول پیاده‌سازی شده‌اند. برای
              استقرار امن، تنظیمات محیطی، مجوزهای سرویس و گواهی HTTPS را مطابق
              زیرساخت خود تکمیل کنید.
            </p>
          </div>
        </section>

        <section className="ll-section ll-difference" id="difference">
          <div className="ll-shell">
            <div className="ll-section-heading ll-section-heading--center">
              <div>
                <span className="ll-kicker">بیش از یک ظاهر آماده</span>
                <h2>تفاوت در چیزهایی است که پشت صفحه‌اند.</h2>
              </div>
              <p>
                در انتخاب محصول آموزشی، فقط به نمای نخست نگاه نکنید؛ به تجربهٔ
                کاربر، نقش‌ها و قابلیت ادامهٔ توسعه هم توجه کنید.
              </p>
            </div>
            <div
              className="ll-compare"
              role="table"
              aria-label="مقایسهٔ قالب نمایشی و پلتفرم Lumina Learn"
            >
              <div className="ll-compare__head" role="row">
                <span role="columnheader">معیار</span>
                <span role="columnheader">قالبِ صرفاً نمایشی</span>
                <span role="columnheader">Lumina Learn</span>
              </div>
              <div className="ll-compare__row" role="row">
                <strong role="rowheader">تجربهٔ سمت کاربر</strong>
                <span role="cell">تمرکز بر ظاهر صفحه</span>
                <span role="cell">
                  <Check size={15} /> کاتالوگ، صفحهٔ درس و مسیر یادگیری
                </span>
              </div>
              <div className="ll-compare__row" role="row">
                <strong role="rowheader">ابزارهای کاری</strong>
                <span role="cell">ممکن است بیرون از قالب باشند</span>
                <span role="cell">
                  <Check size={15} /> فضای دانشجو، مدرس و مدیر
                </span>
              </div>
              <div className="ll-compare__row" role="row">
                <strong role="rowheader">منطق محصول</strong>
                <span role="cell">اغلب نیازمند پیاده‌سازی جدا</span>
                <span role="cell">
                  <Check size={15} /> React در کنار سرور Express
                </span>
              </div>
              <div className="ll-compare__row" role="row">
                <strong role="rowheader">توسعهٔ بعدی</strong>
                <span role="cell">وابسته به امکانات قالب</span>
                <span role="cell">
                  <Check size={15} /> سورس TypeScript برای سفارشی‌سازی
                </span>
              </div>
            </div>
            <p className="ll-compare__footnote">
              این مقایسه به‌صورت کلی میان قالب نمایشی و یک محصول فول‌استک است؛
              امکانات هر قالب دیگر ممکن است متفاوت باشد.
            </p>
          </div>
        </section>

        <section className="ll-section ll-setup" id="setup">
          <div className="ll-shell ll-setup__layout">
            <div className="ll-setup__copy">
              <span className="ll-kicker">مسیر شروع</span>
              <h2>
                از کد تا
                <br />
                <em>محیط خودتان.</em>
              </h2>
              <p>
                پروژه را در محیط Node.js بالا بیاورید، متغیرها را مطابق
                سرویس‌های انتخابی‌تان تنظیم کنید و پس از build روی زیرساخت
                سازگار مستقر کنید.
              </p>
              <div className="ll-setup__note">
                <Rocket size={18} />
                <span>
                  <strong>استقرار دست شماست</strong>
                  <small>
                    سازگاری نهایی با محیط میزبانی و متغیرهای سرویس خود را بررسی
                    کنید.
                  </small>
                </span>
              </div>
            </div>
            <div className="ll-setup-list">
              {installSteps.map((step) => (
                <div className="ll-setup-step" key={step.number}>
                  <span className="ll-setup-step__number">{step.number}</span>
                  <div className="ll-setup-step__content">
                    <strong>{step.title}</strong>
                    <code dir="ltr">{step.code}</code>
                  </div>
                  <Check size={17} className="ll-setup-step__check" />
                </div>
              ))}
            </div>
          </div>
          <div className="ll-shell ll-deploy-strip">
            <div>
              <span className="ll-deploy-strip__icon">
                <Code2 size={17} />
              </span>
              <span>
                <strong>پشتهٔ اجرایی</strong>
                <small>React · Vite · Express · Node.js</small>
              </span>
            </div>
            <span className="ll-deploy-strip__divider" />
            <div>
              <span className="ll-deploy-strip__icon ll-deploy-strip__icon--mint">
                <ShieldCheck size={17} />
              </span>
              <span>
                <strong>آمادهٔ اتصال به سرویس‌های شما</strong>
                <small>مقادیر حساس فقط در پیکربندی محیطی</small>
              </span>
            </div>
            <span className="ll-deploy-strip__divider" />
            <div>
              <span className="ll-deploy-strip__icon ll-deploy-strip__icon--sand">
                <Puzzle size={17} />
              </span>
              <span>
                <strong>قابل توسعه</strong>
                <small>جزئیات متناسب با نیاز کسب‌وکار شما</small>
              </span>
            </div>
          </div>
        </section>

        <section className="ll-section ll-faq" id="faq">
          <div className="ll-shell ll-faq__layout">
            <div className="ll-faq__heading">
              <span className="ll-kicker">پاسخ پیش از خرید</span>
              <h2>پرسش‌های رایج</h2>
              <p>نکات فنی و خرید را پیش از تصمیم‌گیری با دقت مرور کنید.</p>
              <a href="#purchase" className="ll-text-link">
                اطلاعات مارکت <ArrowLeft size={16} />
              </a>
            </div>
            <div className="ll-faq__items">
              {faqs.map((faq, index) => (
                <article
                  className={`ll-faq-item${faqOpen === index ? " ll-faq-item--open" : ""}`}
                  key={faq.question}
                >
                  <h3>
                    <button
                      aria-expanded={faqOpen === index}
                      aria-controls={`faq-panel-${index}`}
                      onClick={() =>
                        setFaqOpen(faqOpen === index ? null : index)
                      }
                    >
                      {faq.question}
                      <ChevronDown size={18} />
                    </button>
                  </h3>
                  <div
                    className="ll-faq-item__answer"
                    id={`faq-panel-${index}`}
                    hidden={faqOpen !== index}
                  >
                    <p>{faq.answer}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ll-purchase" id="purchase">
          <div className="ll-shell ll-purchase__inner">
            <div className="ll-purchase__copy">
              <span className="ll-kicker ll-kicker--light">
                گام بعدی، بررسی محصول است
              </span>
              <h2>برای ساختن تجربهٔ آموزشیِ خودتان آماده‌اید؟</h2>
              <p>
                دموی فعلی را ببینید و پیش از خرید، نسخه، فایل‌های همراه، لایسنس
                و شرایط پشتیبانی را در مارکت بررسی کنید.
              </p>
              <div className="ll-purchase__actions">
                <button
                  className="ll-button ll-button--mint"
                  onClick={goToDemo}
                >
                  مشاهدهٔ دموی زنده <CirclePlay size={17} />
                </button>
                {marketplaceUrl ? (
                  <a
                    className="ll-button ll-button--purchase"
                    href={marketplaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    خرید و دریافت محصول <ArrowLeft size={16} />
                  </a>
                ) : (
                  <a
                    className="ll-button ll-button--purchase"
                    href="#purchase-note"
                  >
                    اطلاعات خرید در مارکت <ArrowLeft size={16} />
                  </a>
                )}
              </div>
            </div>
            <div className="ll-purchase__card" id="purchase-note">
              <div className="ll-purchase__card-mark">
                <BrandMark light />
              </div>
              <span className="ll-kicker ll-kicker--light">Lumina Learn</span>
              <strong>پلتفرم آموزشی Full-Stack</strong>
              <div className="ll-purchase__spec">
                <span>
                  <Check size={14} /> رابط کاربری فارسی و RTL
                </span>
                <span>
                  <Check size={14} /> مدیریت دانشجو، مدرس و مدیر
                </span>
                <span>
                  <Check size={14} /> React + TypeScript + Express
                </span>
              </div>
              {!marketplaceUrl && (
                <small className="ll-purchase__config">
                  پیوند خرید نهایی پس از درج نشانی محصول در متغیر{" "}
                  <code dir="ltr">VITE_MARKETPLACE_URL</code> فعال می‌شود.
                </small>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="ll-footer">
        <div className="ll-shell ll-footer__inner">
          <a className="ll-brand ll-brand--footer" href="#top">
            <BrandMark light />
            <span className="ll-brand__word">
              <strong>Lumina Learn</strong>
              <small>آموزش، با زیرساختی برای رشد</small>
            </span>
          </a>
          <span className="ll-footer__note">
            یک محصول فول‌استک برای تجربهٔ آموزش آنلاین.
          </span>
          <button className="ll-footer__back" onClick={goToDemo}>
            رفتن به سامانه <ArrowLeft size={15} />
          </button>
        </div>
      </footer>
    </div>
  );
};
