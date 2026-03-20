import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "How does this work?",
    answer:
      "Upload a screenshot of your course schedule. Our AI extracts dates, times, and event details. You can then download a standard .ics file or sync directly to Google Calendar.",
  },
  {
    question: "What calendar apps are supported?",
    answer:
      "The .ics files work with Google Calendar, Apple Calendar, Microsoft Outlook, and most other calendar apps. You can also sync directly to Google Calendar.",
  },
  {
    question: "Is it free?",
    answer: "Yes, completely free. No hidden fees or subscriptions.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No account is needed to download the .ics file. You only need to sign in if you want to sync directly to Google Calendar.",
  },
  {
    question: "How do recurring events work?",
    answer:
      "Weekly classes repeat for 16 weeks by default, or until your semester end date if you set one. One-time events are added on their specific dates.",
  },
  {
    question: "Is my data private?",
    answer:
      "Your images are processed only to generate the calendar file and are not stored. Google Calendar sync uses secure OAuth and adds events directly to your account.",
  },
];

export function FAQ() {
  return (
    <section>
      <h2 className="mb-3 text-sm font-medium">FAQ</h2>
      <Accordion type="single" collapsible className="w-full">
        {FAQS.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border-b py-0"
          >
            <AccordionTrigger className="py-3 text-left text-sm hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-3 text-sm">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
