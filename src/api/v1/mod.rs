/*
 * Copyright (C) 2021  Aravinth Manivannan <realaravinth@batsense.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
use actix_web::web::ServiceConfig;
use uuid::Uuid;

pub mod account;
pub mod auth;
pub mod bench;
mod meta;
pub mod routes;
pub use routes::ROUTES;
#[cfg(test)]
mod tests;

pub fn services(cfg: &mut ServiceConfig) {
    meta::services(cfg);
    auth::services(cfg);
    bench::services(cfg);
    account::services(cfg);
}

pub fn get_random(len: usize) -> String {
    use rand::{distributions::Alphanumeric, rngs::ThreadRng, thread_rng, Rng};
    use std::iter;

    let mut rng: ThreadRng = thread_rng();

    iter::repeat(())
        .map(|()| rng.sample(Alphanumeric))
        .map(char::from)
        .take(len)
        .collect::<String>()
}

pub fn get_uuid() -> Uuid {
    Uuid::new_v4()
}

pub fn get_admin_check_login() -> crate::CheckLogin {
    crate::CheckLogin::new(crate::V1_API_ROUTES.auth.register)
}
