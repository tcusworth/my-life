import { commandBus } from "../command-bus";

export const OS = {
  tasks: {
    create(payload: any) {
      return commandBus.dispatch({
        type: "TASK_CREATE",
        payload,
        meta: { source: "ui" },
      });
    },

    update(payload: any) {
      return commandBus.dispatch({
        type: "TASK_UPDATE",
        payload,
        meta: { source: "ui" },
      });
    },
  },

  projects: {
    create(payload: any) {
      return commandBus.dispatch({
        type: "PROJECT_CREATE",
        payload,
        meta: { source: "ui" },
      });
    },
  },

  contacts: {
    create(payload: any) {
      return commandBus.dispatch({
        type: "CONTACT_CREATE",
        payload,
        meta: { source: "ui" },
      });
    },
  },

  inbox: {
    process(payload: any) {
      return commandBus.dispatch({
        type: "INBOX_PROCESS",
        payload,
        meta: { source: "ai" },
      });
    },
  },

  devices: {
    register(payload: any) {
      return commandBus.dispatch({
        type: "DEVICE_REGISTER",
        payload,
        meta: { source: "ui" },
      });
    },
  },
};