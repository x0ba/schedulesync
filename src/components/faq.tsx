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
    <section className="w-full">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left Column - Section Label + Heading */}
        <div className="lg:col-span-4">
          <span className="section-label mb-4 block">Support</span>
          <h2 className="text-foreground text-3xl leading-tight font-bold tracking-tight lg:text-4xl">
            Frequently
            <br />
            Asked
            <br />
            Questions
          </h2>
        </div>

        {/* Right Column - Accordion */}
        <div className="lg:col-span-8">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-border/50 border-b py-2"
              >
                <AccordionTrigger className="hover:text-accent group [&[data-state=open]]:text-accent py-4 text-left transition-colors">
                  <div className="flex items-start gap-4">
                    <span className="text-accent text-sm font-medium">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="font-medium">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 pl-10">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
