"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Workflow } from "lucide-react";
import { alurKerjaApp, panduanItems } from "@/constant/panduanDatas";

export default function PanduanPage() {
  const [showBackupReminder, setShowBackupReminder] = useState(false);
  const [reminderType, setReminderType] = useState<"bulanan" | "tahunan">(
    "bulanan"
  );

  useEffect(() => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const month = today.getMonth();

    if (dayOfMonth >= 25) {
      setShowBackupReminder(true);
      if (month === 11) setReminderType("tahunan");
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panduan Aplikasi</h1>
        <p className="text-muted-foreground">
          Tata cara penggunaan fitur-fitur utama dalam sistem.
        </p>
      </div>

      {/* Reminder Backup */}
      {showBackupReminder && (
        <Alert className="border-yellow-500 bg-yellow-50 text-yellow-800">
          <Lightbulb className="h-5 w-5 !text-yellow-600" />
          <AlertTitle className="font-bold">
            Pengingat Backup Data{" "}
            {reminderType === "tahunan" ? "Tahunan" : "Bulanan"}
          </AlertTitle>
          <AlertDescription>
            Sudah akhir {reminderType}. Unduh laporan keuangan sebagai cadangan
            melalui halaman <b>Ringkasan Keuangan</b>.
          </AlertDescription>
        </Alert>
      )}

      {/* Alur Kerja */}
      <Alert className="border-blue-500 bg-blue-50 text-blue-800">
        <Workflow className="h-5 w-5 !text-blue-600" />
        <AlertTitle className="font-bold">Alur Kerja Utama Aplikasi</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal space-y-1 pl-5">
            {alurKerjaApp.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </AlertDescription>
      </Alert>

      {/* Panduan Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Panduan Detail per Fitur</CardTitle>
          <CardDescription>
            Klik bagian di bawah untuk melihat detail langkah-langkahnya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {panduanItems.map((item) => (
              <AccordionItem value={item.value} key={item.value}>
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-6 w-6 text-primary" />
                    {item.title}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-6 pl-4 pt-2">
                  {item.content.map((section) => (
                    <div key={section.subtitle}>
                      <h4 className="font-semibold">{section.subtitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                      <ol className="ml-4 mt-2 list-decimal space-y-1 text-sm">
                        {section.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
