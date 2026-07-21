import { useState, type SyntheticEvent } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import { useAddComplaintComment, useComplaintComments } from "@/hooks/useComplaintComments";
import type { ComplaintComment } from "@/api/services/complaintCommentService";

interface ComplaintCommentsProps {
  complaintId: number;
}

export default function ComplaintComments({ complaintId }: ComplaintCommentsProps) {
  const [message, setMessage] = useState("");

  const { data, isPending: isLoading, isError } = useComplaintComments(complaintId);

  const comments: ComplaintComment[] = data ?? [];
  const addCommentMutation = useAddComplaintComment(complaintId);

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    addCommentMutation.mutate(
      { message: trimmedMessage },
      {
        onSuccess: () => setMessage(""),
      },
    );
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
        Comments
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Write a comment or update..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={addCommentMutation.isPending}
          />

          <Button
            type="submit"
            variant="contained"
            endIcon={<SendRoundedIcon />}
            disabled={!message.trim() || addCommentMutation.isPending}
            sx={{ alignSelf: "flex-end" }}
          >
            {addCommentMutation.isPending ? "Posting..." : "Post"}
          </Button>
        </Box>
      </form>

      {addCommentMutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Unable to post the comment. Please try again.
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {isError && <Alert severity="error">Unable to load comments for this complaint.</Alert>}

      {!isLoading && !isError && comments.length === 0 && (
        <Typography color="text.secondary">No comments yet. Be the first to add one.</Typography>
      )}

      {!isLoading &&
        !isError &&
        comments.map((comment: ComplaintComment) => (
          <Box key={comment.id} sx={{ pt: 2 }}>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Avatar>{comment.authorName?.charAt(0)?.toUpperCase() || "U"}</Avatar>

              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{comment.authorName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {comment.authorRole}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                <Typography sx={{ mt: 0.75, whiteSpace: "pre-wrap" }}>{comment.message}</Typography>
              </Box>
            </Box>

            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                mt: 2,
              }}
            />
          </Box>
        ))}
    </Paper>
  );
}
