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
      "Simply upload a screenshot of your course schedule, class timetable, or event list. Our AI analyzes the image to extract dates, times, and event details, then generates a standard calendar file (.ics) that you can download.",
  },
  {
    question: "What calendar apps are supported?",
    answer:
      "The generated .ics files are compatible with all major calendar applications, including Google Calendar, Apple Calendar (iCal), Microsoft Outlook, and many others.",
  },
  {
    question: "Is it free to use?",
    answer:
      "Yes, this tool is completely free to use. There are no hidden fees or subscriptions required to convert your schedules.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No account is required. You can upload your schedule and download the calendar file immediately without signing up.",
  },
  {
    question: "Is my data private?",
    answer:
      "We process your uploaded images solely for the purpose of generating the calendar file. Your schedule data is not permanently stored or shared with third parties.",
  },
];

export function FAQ() {
  return (
    <section className="mt-20 w-full">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-muted-foreground">
          Everything you need to know about converting your schedule.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {FAQS.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

