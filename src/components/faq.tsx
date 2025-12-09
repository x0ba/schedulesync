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
      "Simply upload a screenshot of your course schedule, class timetable, or event list. Our AI analyzes the image to extract dates, times, and event details. You can then download a standard calendar file (.ics) or sync directly to your Google Calendar.",
  },
  {
    question: "Can I sync to Google Calendar?",
    answer:
      "Yes! If you sign in and connect your Google account, you can sync your schedule directly to Google Calendar. We'll create a new calendar in your Google Calendar account with all your events. Recurring events (like weekly classes) will automatically repeat for 16 weeks, and one-time events will be added on their specific dates.",
  },
  {
    question: "What calendar apps are supported?",
    answer:
      "The generated .ics files are compatible with all major calendar applications, including Google Calendar, Apple Calendar (iCal), Microsoft Outlook, and many others. For Google Calendar users, you can also sync directly without downloading a file.",
  },
  {
    question: "Is it free to use?",
    answer:
      "Yes, this tool is completely free to use. There are no hidden fees or subscriptions required to convert your schedules or sync to Google Calendar.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No account is required to download the calendar file (.ics). However, if you want to sync directly to Google Calendar, you'll need to sign in and connect your Google account with Calendar permissions.",
  },
  {
    question: "How do recurring events work?",
    answer:
      "Recurring events (like weekly classes) are automatically set to repeat weekly for 16 weeks by default. One-time events are added on their specific dates. All events include details like location, course code, and instructor information when available.",
  },
  {
    question: "Is my data private?",
    answer:
      "We process your uploaded images solely for the purpose of generating the calendar file. Your schedule data is not permanently stored or shared with third parties. When syncing to Google Calendar, events are added directly to your Google account using secure OAuth authentication.",
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

