import Link from "next/link";
import { PageMast } from "@/components/PageMast";
import { RelatedLinks } from "@/components/RelatedLinks";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Our Story",
  description:
    "Squeaky Solutions began with three young entrepreneurs, a shared passion for cars, and a belief that a business could stand for something bigger than profit.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageMast
        title="It started with more than cars"
        crumbs={[{ href: "/about", label: "Our Story" }]}
      >
        <p>
          Three people, a shared passion for cars, and a belief that a small
          business can still make a difference.
        </p>
      </PageMast>
      <article className="story section-pad mx-auto !pt-10">
        <p>
          Squeaky Solutions began with three young entrepreneurs, a shared
          passion for cars, and a belief that a business could stand for
          something bigger than profit.
        </p>
        <p>
          We didn’t want to build something ordinary. We wanted to build
          something that represented hard work, purpose, quality, honesty, and
          the idea that even a small business can make a difference in the
          world.
        </p>
        <p>
          That is why giving back has been part of our vision from the
          beginning.
        </p>
        <p>
          As Squeaky Solutions grows, we want our success to help support
          humanitarian efforts for people and families facing hardship in
          Palestine, Lebanon and Sudan.
        </p>
        <p>
          Because to us, success means more when it can reach beyond ourselves.
          It means more when something you build with your own hands can
          eventually help someone you may never meet.
        </p>
        <p>And that belief is at the heart of Squeaky Solutions.</p>

        <hr className="story-break" />

        <h2>Three people. One idea. A lot to prove.</h2>
        <p>We started with an idea. A passion. And the willingness to work for it.</p>
        <p>
          Like a lot of young people, we looked at the world around us and
          realised that if we wanted to create something meaningful, we
          couldn’t sit around waiting for someone else to give us the
          opportunity.
        </p>
        <p>We had to create it ourselves.</p>
        <p>So that is exactly what we decided to do.</p>
        <p>
          Squeaky Solutions became our chance to build something from the
          ground up. Something we could put our names behind.
        </p>

        <h2>Why car detailing?</h2>
        <p>Because we genuinely love the transformation.</p>
        <p>There’s something about seeing a car before the work begins.</p>
        <p>The dust. The neglected wheels. The marks that slowly built up over years.</p>
        <p>Then you start working. One section at a time.</p>
        <p>Slowly, the car begins to change.</p>
        <p>It doesn’t just look cleaner. It feels different.</p>
        <p>That transformation is what made us fall in love with detailing.</p>

        <h2>The Squeaky standard</h2>
        <p>Squeaky Solutions is being built around a simple principle:</p>
        <p className="story-pull">Honest work with purpose.</p>
        <p>
          We want customers to know what they’re paying for. No unnecessary
          surprises. Just honest communication.
        </p>

        <h2>A business with purpose</h2>
        <p>
          Cars may be our passion. But they’re not the entire reason we want
          Squeaky Solutions to succeed.
        </p>
        <p>
          We also want to see what can happen when three young people refuse
          to believe that making a difference is something reserved for massive
          organisations or wealthy people.
        </p>
        <p>Everyone starts somewhere.</p>
        <p>Then, as you grow, your ability to help grows with you.</p>
        <p>That’s the vision.</p>
        <p>
          Because when somebody chooses to book with us, they’re doing more
          than paying for a detail. They’re helping us make a difference.
        </p>

        <hr className="story-break" />

        <h2>This is what we’re building</h2>
        <p>We’re three young entrepreneurs trying to prove something.</p>
        <p>That affordable doesn’t have to mean low quality.</p>
        <p>That honesty can still be good business.</p>
        <p>That something meaningful can begin very small.</p>
        <p>One car. One customer. One opportunity at a time.</p>
        <p>
          Through honest work. Through quality. And by never forgetting why we
          started.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/book" className="btn btn-accent">
            Book a detail
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            Get in touch
          </Link>
        </div>

        <RelatedLinks
          links={[
            {
              href: "/faq",
              label: "FAQ",
              blurb: "Access, dogs, cancel window, what we don’t do.",
            },
            {
              href: "/jobs",
              label: "Typical jobs",
              blurb: "How a visit usually goes.",
            },
          ]}
        />
      </article>
    </>
  );
}
