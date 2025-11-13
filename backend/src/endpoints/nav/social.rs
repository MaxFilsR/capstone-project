use crate::{
    jwt::AuthenticatedUser,
    schemas::{Class, Equipped},
    level::exp_needed_for_level,
};
use actix_web::{HttpResponse, web, get, put};
use sqlx::PgPool;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct FriendList {
    pub user_id: i32,
    pub username: String,
    pub class: Class, 
    pub level: i32,
    pub exp_leftover: i32,
    pub exp_needed: i32,
}

#[derive(Serialize)]
pub struct FriendDetailResponse {
    pub username: String,
    pub class: Class, 
    pub level: i32,
    pub exp_leftover: i32,
    pub exp_needed: i32,
    pub streak: i32,
    pub equipped: Equipped, 
}

#[derive(Deserialize)]
pub struct UpdateFriendsRequest {
    pub friend_ids: Vec<i32>,
}

#[derive(Serialize)]
pub struct LeaderboardEntry {
    pub user_id: i32,
    pub username: String,
    pub class: Class,
    pub level: i32,
    pub exp_leftover: i32,
    pub exp_needed: i32,
}

// Returns a list of friends
#[get("/social/friends")]
pub async fn read_friends(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> HttpResponse {
    let friends_result = sqlx::query!(
        r#"
        SELECT friends
        FROM characters
        WHERE user_id = $1
        "#,
        user.id
    )
    .fetch_one(pool.get_ref())
    .await;

    let friends = match friends_result {
        Ok(query) => query.friends,
        Err(_) => return HttpResponse::InternalServerError().body("Failed to fetch friends list"),
    };

    // No friends, return empty list
    if friends.is_empty() {
        return HttpResponse::Ok().json(Vec::<FriendList>::new());
    }

    let friends_details = sqlx::query!(
        r#"
        SELECT user_id, username, class as "class: Class", level, exp_leftover
        FROM characters
        WHERE user_id = ANY($1)
        "#,
        &friends
    )
    .fetch_all(pool.get_ref())
    .await;

    match friends_details {
        Ok(queries) => {
            let friends_list: Vec<FriendList> = queries
                .into_iter()
                .map(|query| FriendList {
                    user_id: query.user_id,
                    username: query.username,
                    class: query.class,
                    level: query.level,
                    exp_leftover: query.exp_leftover,
                    exp_needed: exp_needed_for_level(query.level + 1),
                })
                .collect();
            HttpResponse::Ok().json(friends_list)
        }
        Err(_) => HttpResponse::InternalServerError().body("Failed to fetch friends details"),
    }
}

// Get specific friend's full character details 
#[get("/social/friends/{id}")]
pub async fn read_friend_detail(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    friend_id: web::Path<i32>,
) -> HttpResponse {
    let friend_id = friend_id.into_inner();

    // verify that the requested user is in the friends list
    let is_friend = sqlx::query!(
        r#"
        SELECT EXISTS(
            SELECT 1 FROM characters 
            WHERE user_id = $1 AND $2 = ANY(friends)
        ) as "is_friend!"
        "#,
        user.id,
        friend_id
    )
    .fetch_one(pool.get_ref())
    .await;

    // Return if not friends (403 Forbidden)
    match is_friend {
        Ok(query) => {
            if !query.is_friend {
                return HttpResponse::Forbidden().body("User is not in your friends list");
            }
        }
        Err(_) => return HttpResponse::InternalServerError().body("Failed to verify friendship"),
    }

    let character_result = sqlx::query!(
        r#"
        SELECT username,
               class as "class: Class", level, exp_leftover, streak, equipped as "equipped: Equipped"
        FROM characters
        WHERE user_id = $1
        "#,
        friend_id
    )
    .fetch_one(pool.get_ref())
    .await;

    match character_result {
        Ok(query) => {          
            let response = FriendDetailResponse {
                username: query.username,
                class: query.class,
                level: query.level,
                exp_leftover: query.exp_leftover,
                exp_needed: exp_needed_for_level(query.level + 1),
                streak: query.streak,
                equipped: query.equipped,
            };
            HttpResponse::Ok().json(response)
        }
        Err(_) => HttpResponse::NotFound().body("Friend not found"),
    }
}

// Update friends list
#[put("/social/friends")]
pub async fn update_friends(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    req: web::Json<UpdateFriendsRequest>,
) -> HttpResponse {
    // Validate that all provided friend IDs exist 
    let mut validated_friends = req.friend_ids.clone();

    // Make sure you can't add yourself as a friend
    validated_friends.retain(|&id| id != user.id);

    // Verify all friend IDs exist in the database
    if !validated_friends.is_empty() {
        let existing_users = sqlx::query!(
            r#"
            SELECT user_id
            FROM characters
            WHERE user_id = ANY($1)
            "#,
            &validated_friends
        )
        .fetch_all(pool.get_ref())
        .await;

        match existing_users {
            Ok(queries) => {
                let existing_ids: Vec<i32> = queries.into_iter().map(|q| q.user_id).collect();
                if existing_ids.len() != validated_friends.len() {
                    return HttpResponse::BadRequest().body("Some user IDs do not exist");
                }
            }
            Err(_) => {
                return HttpResponse::InternalServerError().body("Failed to validate user IDs")
            }
        }
    }

    let update_result = sqlx::query!(
        r#"
        UPDATE characters
        SET friends = $2
        WHERE user_id = $1
        "#,
        user.id,
        &validated_friends
    )
    .execute(pool.get_ref())
    .await;

    match update_result {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({
            "message": "Friends list updated successfully",
            "friend_count": validated_friends.len()
        })),
        Err(_) => HttpResponse::InternalServerError().body("Failed to update friends list"),
    }
}

// Get global leaderboard sorted by level and exp
#[get("/social/leaderboard")]
pub async fn read_leaderboard(
    _user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> HttpResponse {
    let leaderboard_result = sqlx::query!(
        r#"
        SELECT user_id, username, class as "class: Class", level, exp_leftover
        FROM characters
        ORDER BY level DESC, exp_leftover DESC
        LIMIT 100
        "#
    )
    .fetch_all(pool.get_ref())
    .await;


    match leaderboard_result {
        Ok(queries) => {
            let leaderboard: Vec<LeaderboardEntry> = queries
                .into_iter()
                .map(|query| LeaderboardEntry {
                    user_id: query.user_id,
                    username: query.username,
                    class: query.class,
                    level: query.level,
                    exp_leftover: query.exp_leftover,
                    exp_needed: exp_needed_for_level(query.level + 1),
                })
                .collect();
            HttpResponse::Ok().json(leaderboard)
        }
        Err(_) => HttpResponse::InternalServerError().body("Failed to fetch leaderboard"),
    }
}
