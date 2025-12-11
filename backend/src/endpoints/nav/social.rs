use {
    crate::utils::{
        jwt::AuthenticatedUser,
        level::exp_needed_for_level,
        schemas::{
            Class,
            Equipped,
        },
    },
    actix_web::{
        HttpResponse,
        delete,
        get,
        post,
        put,
        web,
    },
    serde::{
        Deserialize,
        Serialize,
    },
    sqlx::PgPool,
};

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

#[derive(Serialize)]
pub struct FriendRequest {
    pub request_id: i32, // ID of the friend request
    pub sender_id: i32,  // User ID of the sender
    pub sender_username: String,
    pub sender_class: Class,
    pub sender_level: i32,
    pub created: chrono::NaiveDateTime,
}

#[derive(Deserialize)]
pub struct SendFriendRequest {
    pub recipient_id: i32,
}

#[derive(Deserialize)]
pub struct RespondToRequest {
    pub request_id: i32,
    pub accept: bool,
}

// Returns a list of friends
#[get("/social/friends")]
pub async fn read_friends(user: AuthenticatedUser, pool: web::Data<PgPool>) -> HttpResponse {
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
                return HttpResponse::InternalServerError().body("Failed to validate user IDs");
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
pub async fn read_leaderboard(_user: AuthenticatedUser, pool: web::Data<PgPool>) -> HttpResponse {
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

#[get("/social/leaderboard/{id}")]
pub async fn read_leaderboard_detail(
    _user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    user_id: web::Path<i32>,
) -> HttpResponse {
    let user_id = user_id.into_inner();

    // Check if user is on the leaderboard (top 100)
    let is_on_leaderboard = sqlx::query!(
        r#"
        SELECT EXISTS(
            SELECT 1 FROM (
                SELECT user_id
                FROM characters
                ORDER BY level DESC, exp_leftover DESC
                LIMIT 100
            ) AS leaderboard
            WHERE user_id = $1
        ) as "is_on_leaderboard!"
        "#,
        user_id
    )
    .fetch_one(pool.get_ref())
    .await;

    match is_on_leaderboard {
        Ok(query) => {
            if !query.is_on_leaderboard {
                return HttpResponse::Forbidden().body("User is not on the leaderboard");
            }
        }
        Err(_) => {
            return HttpResponse::InternalServerError().body("Failed to verify leaderboard status");
        }
    }

    // Now fetch the user's details
    let character_result = sqlx::query!(
        r#"
        SELECT username,
               class as "class: Class", level, exp_leftover, streak, equipped as "equipped: Equipped"
        FROM characters
        WHERE user_id = $1
        "#,
        user_id
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
        Err(_) => HttpResponse::NotFound().body("User not found"),
    }
}

// Send a friend request
#[post("/social/friends/request")]
pub async fn send_friend_request(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    req: web::Json<SendFriendRequest>,
) -> HttpResponse {
    let recipient_id = req.recipient_id;

    // Can't send request to yourself
    if recipient_id == user.id {
        return HttpResponse::BadRequest().body("Cannot send friend request to yourself");
    }

    // Check if target user exists
    let user_exists = sqlx::query!(
        r#"
        SELECT EXISTS(SELECT 1 FROM characters WHERE user_id = $1) as "exists!"
        "#,
        recipient_id
    )
    .fetch_one(pool.get_ref())
    .await;

    match user_exists {
        Ok(query) => {
            if !query.exists {
                return HttpResponse::NotFound().body("User not found");
            }
        }
        Err(_) => return HttpResponse::InternalServerError().body("Failed to verify user"),
    }

    // Check if already friends
    let already_friends = sqlx::query!(
        r#"
        SELECT EXISTS(
            SELECT 1 FROM characters 
            WHERE user_id = $1 AND $2 = ANY(friends)
        ) as "is_friend!"
        "#,
        user.id,
        recipient_id
    )
    .fetch_one(pool.get_ref())
    .await;

    match already_friends {
        Ok(query) => {
            if query.is_friend {
                return HttpResponse::BadRequest().body("Already friends");
            }
        }
        Err(_) => {
            return HttpResponse::InternalServerError().body("Failed to check friendship status");
        }
    }

    // Check if request already exists (either direction)
    let existing_request = sqlx::query!(
        r#"
        SELECT EXISTS(
            SELECT 1 FROM friend_requests 
            WHERE (sender_id = $1 AND recipient_id = $2)
               OR (sender_id = $2 AND recipient_id = $1)
        ) as "exists!"
        "#,
        user.id,
        recipient_id
    )
    .fetch_one(pool.get_ref())
    .await;

    match existing_request {
        Ok(query) => {
            if query.exists {
                return HttpResponse::BadRequest().body("Friend request already pending");
            }
        }
        Err(_) => {
            return HttpResponse::InternalServerError().body("Failed to check existing requests");
        }
    }

    // Create friend request
    let insert_result = sqlx::query!(
        r#"
        INSERT INTO friend_requests (sender_id, recipient_id)
        VALUES ($1, $2)
        RETURNING id
        "#,
        user.id,
        recipient_id
    )
    .fetch_one(pool.get_ref())
    .await;

    match insert_result {
        Ok(query) => HttpResponse::Ok().json(serde_json::json!({
            "message": "Friend request sent",
            "request_id": query.id
        })),
        Err(_) => HttpResponse::InternalServerError().body("Failed to send friend request"),
    }
}

// Get incoming friend requests (Accept or Deny)
#[get("/social/friends/requests/incoming")]
pub async fn get_incoming_requests(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> HttpResponse {
    // Join allows it to get data from other table (characters)
    let requests_result = sqlx::query!(
        r#"
        SELECT fr.id, fr.sender_id, fr.created,
               c.username, c.class as "class: Class", c.level
        FROM friend_requests fr
        JOIN characters c ON fr.sender_id = c.user_id
        WHERE fr.recipient_id = $1
        ORDER BY fr.created DESC
        "#,
        user.id
    )
    .fetch_all(pool.get_ref())
    .await;

    match requests_result {
        Ok(queries) => {
            let requests: Vec<FriendRequest> = queries
                .into_iter()
                .map(|q| FriendRequest {
                    request_id: q.id,
                    sender_id: q.sender_id,
                    sender_username: q.username,
                    sender_class: q.class,
                    sender_level: q.level,
                    created: q.created,
                })
                .collect();
            HttpResponse::Ok().json(requests)
        }
        Err(_) => HttpResponse::InternalServerError().body("Failed to fetch friend requests"),
    }
}

// Get outgoing friend requests (Waitng for reply)
#[get("/social/friends/requests/outgoing")]
pub async fn get_outgoing_requests(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
) -> HttpResponse {
    // Gets info for the Recipient anf gets outgoing requests by matching sender_id with current user id
    let requests_result = sqlx::query!(
        r#"
        SELECT fr.id, fr.recipient_id as sender_id, fr.created,
               c.username, c.class as "class: Class", c.level
        FROM friend_requests fr
        JOIN characters c ON fr.recipient_id = c.user_id
        WHERE fr.sender_id = $1
        ORDER BY fr.created DESC
        "#,
        user.id
    )
    .fetch_all(pool.get_ref())
    .await;

    match requests_result {
        Ok(queries) => {
            let requests: Vec<FriendRequest> = queries
                .into_iter()
                .map(|q| FriendRequest {
                    request_id: q.id,
                    sender_id: q.sender_id,
                    sender_username: q.username,
                    sender_class: q.class,
                    sender_level: q.level,
                    created: q.created,
                })
                .collect();
            HttpResponse::Ok().json(requests)
        }
        Err(_) => HttpResponse::InternalServerError().body("Failed to fetch outgoing requests"),
    }
}

// Accept or decline a friend request
#[post("/social/friends/request/respond")]
pub async fn respond_to_request(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    req: web::Json<RespondToRequest>,
) -> HttpResponse {
    let request_id = req.request_id;
    let accept = req.accept;

    // Get the request details and verify it's for this user
    let request_result = sqlx::query!(
        r#"
        SELECT sender_id, recipient_id
        FROM friend_requests
        WHERE id = $1
        "#,
        request_id
    )
    .fetch_one(pool.get_ref())
    .await;

    let (sender_id, recipient_id) = match request_result {
        Ok(query) => {
            if query.recipient_id != user.id {
                return HttpResponse::Forbidden().body("This request is not for you");
            }
            (query.sender_id, query.recipient_id)
        }
        Err(_) => return HttpResponse::NotFound().body("Friend request not found"),
    };

    // Delete the request
    let delete_result = sqlx::query!(
        r#"
        DELETE FROM friend_requests
        WHERE id = $1
        "#,
        request_id
    )
    .execute(pool.get_ref())
    .await;

    if delete_result.is_err() {
        return HttpResponse::InternalServerError().body("Failed to delete request");
    }

    // If accepted, add both users to each other's friends list (transaction to ensure both succeed or neither)
    if accept {
        let mut tx = match pool.begin().await {
            Ok(tx) => tx,
            Err(_) => {
                return HttpResponse::InternalServerError().body("Failed to start transaction");
            }
        };

        // Add Recipient to Sender's friends list
        let update1 = sqlx::query!(
            r#"
            UPDATE characters
            SET friends = array_append(friends, $2)
            WHERE user_id = $1 AND NOT ($2 = ANY(friends))
            "#,
            sender_id,
            recipient_id // person being added
        )
        .execute(&mut *tx)
        .await;

        if update1.is_err() {
            let _ = tx.rollback().await;
            return HttpResponse::InternalServerError().body("Failed to add friend");
        }

        // Add Sender to Recipeint's friends list
        let update2 = sqlx::query!(
            r#"
            UPDATE characters
            SET friends = array_append(friends, $2)
            WHERE user_id = $1 AND NOT ($2 = ANY(friends))
            "#,
            recipient_id,
            sender_id // person being added
        )
        .execute(&mut *tx)
        .await;

        if update2.is_err() {
            let _ = tx.rollback().await;
            return HttpResponse::InternalServerError()
                .body("Failed to add to Recipient's friends list");
        }

        if tx.commit().await.is_err() {
            return HttpResponse::InternalServerError().body("Failed to commit transaction");
        }

        HttpResponse::Ok().json(serde_json::json!({
            "message": "Friend request accepted"
        }))
    } else {
        HttpResponse::Ok().json(serde_json::json!({
            "message": "Friend request declined"
        }))
    }
}

// Remove a friend
#[delete("/social/friends/{id}")]
pub async fn remove_friend(
    user: AuthenticatedUser,
    pool: web::Data<PgPool>,
    friend_id: web::Path<i32>,
) -> HttpResponse {
    let friend_id = friend_id.into_inner();

    // Verify they are friends
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

    match is_friend {
        Ok(query) => {
            if !query.is_friend {
                return HttpResponse::BadRequest().body("User is not in your friends list");
            }
        }
        Err(_) => return HttpResponse::InternalServerError().body("Failed to verify friendship"),
    }

    // Makes ssure to remove from both users' friends lists (transaction)
    let mut tx = match pool.begin().await {
        Ok(tx) => tx,
        Err(_) => return HttpResponse::InternalServerError().body("Failed to start transaction"),
    };

    // Remove friend from the user's friends list
    let update1 = sqlx::query!(
        r#"
        UPDATE characters
        SET friends = array_remove(friends, $2)
        WHERE user_id = $1
        "#,
        user.id,
        friend_id // person being removed
    )
    .execute(&mut *tx)
    .await;

    if update1.is_err() {
        let _ = tx.rollback().await;
        return HttpResponse::InternalServerError()
            .body("Failed to remove friend from user's friend list");
    }

    // Remove the user from the friend's friends list
    let update2 = sqlx::query!(
        r#"
        UPDATE characters
        SET friends = array_remove(friends, $2)
        WHERE user_id = $1
        "#,
        friend_id,
        user.id // person being removed
    )
    .execute(&mut *tx)
    .await;

    if update2.is_err() {
        let _ = tx.rollback().await;
        return HttpResponse::InternalServerError()
            .body("Failed to remove user from friend's friend list");
    }

    if tx.commit().await.is_err() {
        return HttpResponse::InternalServerError().body("Failed to commit transaction");
    }

    HttpResponse::Ok().json(serde_json::json!({
        "message": "Friend removed successfully"
    }))
}
