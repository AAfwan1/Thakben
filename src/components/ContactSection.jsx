
import { FiArrowUpRight, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

const CONTACT = {
  location: "Bashundhara R/A, Block C, Road 2, House 1/f, Dhaka",
  phone: "+880 0000 000000",
  email: "hello@thakben.com",
};

export default function ContactSection() {
  return (
    <section className="bg-black px-6 py-24 text-white sm:px-8 lg:px-10" id="contact">
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
              <span className="text-white/45">
                Talk to us.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-sm leading-7 text-white/50">
              Get in touch with us for apartment availability,
              booking information, or any other questions.
            </p>
          </div>

          {/* Right */}
          <div className="grid gap-3 sm:grid-cols-2">

            <a
              href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
              className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.08]"
            >
              <FiPhone size={20} className="text-white/60" />

              <p className="mt-8 text-xs uppercase tracking-[0.2em] text-white/35">
                Phone
              </p>

              <p className="mt-2 text-sm text-white/75">
                {CONTACT.phone}
              </p>

              <FiArrowUpRight
                size={16}
                className="mt-6 text-white/30 transition group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>

            <a
              href={`mailto:${CONTACT.email}`}
              className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.08]"
            >
              <FiMail size={20} className="text-white/60" />

              <p className="mt-8 text-xs uppercase tracking-[0.2em] text-white/35">
                Email
              </p>

              <p className="mt-2 break-all text-sm text-white/75">
                {CONTACT.email}
              </p>

              <FiArrowUpRight
                size={16}
                className="mt-6 text-white/30 transition group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 sm:col-span-2">
              <FiMapPin size={20} className="text-white/60" />

              <p className="mt-8 text-xs uppercase tracking-[0.2em] text-white/35">
                Location
              </p>

              <p className="mt-2 text-sm text-white/75">
                {CONTACT.location}
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
