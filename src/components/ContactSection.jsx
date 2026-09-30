
import {
  FiArrowUpRight,
  FiFacebook,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
} from "react-icons/fi";

const CONTACT = {
  location: "Bashundhara R/A, Block C, Road 2, House 1/f, Dhaka",
  phone: "+880 1678-090900",
  email: "thakben.bd@gmail.com",
};

const PHONE_LINK = `tel:${CONTACT.phone.replace(/\s/g, "")}`;
const EMAIL_LINK = `mailto:${CONTACT.email}`;
const WHATSAPP_LINK = `https://wa.me/${CONTACT.phone.replace(/\D/g, "")}`;

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/thakben",
    icon: FiFacebook,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/thakben.bd",
    icon: FiInstagram,
  },
  {
    name: "WhatsApp",
    href: WHATSAPP_LINK,
    icon: FiMessageCircle,
  },
];

const CARD =
  "rounded-[24px] border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.08]";

const SOCIAL_CARD =
  "group flex items-center justify-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]";

const ARROW =
  "mt-6 text-white/30 transition group-hover:translate-x-1 group-hover:-translate-y-1";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="bg-black px-6 py-24 text-white sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-2">
          {/* Left */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/40">
              Contact
            </p>

            <h2 className="mt-4 max-w-xl text-4xl font-medium tracking-[-0.04em] sm:text-6xl">
              Have a question?
              <br />
              <span className="text-white/45">Talk to us.</span>
            </h2>

            <p className="mt-6 max-w-lg text-sm leading-7 text-white/50">
              Get in touch with us for apartment availability, booking
              information, or any other questions.
            </p>
          </div>

          {/* Right */}
          <div className="grid grid-cols-2 gap-3">
            {/* Phone */}
            <a href={PHONE_LINK} className={`group ${CARD}`}>
              <FiPhone size={20} className="text-white/60" />

              <p className="mt-8 text-xs uppercase tracking-[0.2em] text-white/35">
                Phone
              </p>

              <p className="mt-2 text-sm text-white/75">
                {CONTACT.phone}
              </p>

              <FiArrowUpRight size={16} className={ARROW} />
            </a>

            {/* Email */}
            <a href={EMAIL_LINK} className={`group ${CARD}`}>
              <FiMail size={20} className="text-white/60" />

              <p className="mt-8 text-xs uppercase tracking-[0.2em] text-white/35">
                Email
              </p>

              <p className="mt-2 break-all text-sm text-white/75">
                {CONTACT.email}
              </p>

              <FiArrowUpRight size={16} className={ARROW} />
            </a>

            {/* Location */}
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Maati+Properties+Ltd.%2C+Bashundhara+R%2FA%2C+Dhaka%2C+Bangladesh"
              target="_blank"
              rel="noopener noreferrer"
              className={`group ${CARD}`}
            >
              <FiMapPin size={20} className="text-white/60" />

              <p className="mt-8 text-xs uppercase tracking-[0.2em] text-white/35">
                Location
              </p>

              <p className="mt-2 text-sm leading-6 text-white/75">
                {CONTACT.location}
              </p>

              <FiArrowUpRight size={16} className={ARROW} />
            </a>

            {/* Social Links */}
            <div className="grid grid-rows-3 gap-3">
              {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className={SOCIAL_CARD}
                >
                  <Icon
                    size={22}
                    className="text-white/60 transition group-hover:text-white"
                  />

                  <span className="text-sm text-white/75 transition group-hover:text-white">
                    {name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

