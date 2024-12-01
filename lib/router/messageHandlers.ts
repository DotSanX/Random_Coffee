export const handlers = {
    message: async (ctx: any) => {
        if (ctx.config.currentEvent) {
            const event = ctx.config.currentEvent
            switch (event) {
                case "nameSetting":
                    ctx.config.userInfo.name = ctx.msg.text
                    ctx.reply("Отличное имя, " + ctx.config.userInfo.name)
                    break;
                
                default:
                    break;
            }
        }
    }
}