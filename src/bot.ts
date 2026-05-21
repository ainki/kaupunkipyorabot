import { Telegraf } from 'telegraf'
import 'dotenv/config'

const bot = new Telegraf(process.env.TG_TOKEN || '')

export { bot }