import { Monitor } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { EmptyState } from "@/components/empty-state";
import { SettingsNav } from "@/components/settings-nav";
import { Badge } from "@/components/ui/badge";
import { getAuthenticatedClient } from "@/lib/pocketbase/server";
import { formatDateTime } from "@/lib/dates";
import type { Device } from "@/types/pocketbase";
import { RegisterDeviceForm } from "./register-device-form";

async function getDevices() {
  const pb = await getAuthenticatedClient();
  if (!pb) return [];

  return pb.collection("devices").getFullList<Device>({
    sort: "-created",
  });
}

export default async function DevicesSettingsPage() {
  const devices = await getDevices();

  return (
    <>
      <AppHeader
        title="Settings"
        description="Manage sync devices and integrations"
      />
      <SettingsNav />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Devices</h2>
          <p className="text-sm text-muted-foreground">
            Register Macs running the EventKit sync agent. API keys authenticate the
            agent against PocketBase.
          </p>
        </div>

        <RegisterDeviceForm />

        {devices.length === 0 ? (
          <EmptyState
            icon={<Monitor className="size-5" />}
            title="No devices registered"
            description="Register your Mac to enable calendar sync through the EventKit agent."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                  <th className="px-4 py-3 font-medium">Last seen</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-card">
                {devices.map((device) => (
                  <tr key={device.id}>
                    <td className="px-4 py-3 font-medium">{device.name}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {device.platform}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(device.lastSeenAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={device.isActive !== false ? "default" : "secondary"}>
                        {device.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
