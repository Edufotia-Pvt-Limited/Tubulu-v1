import { Grid, Card, CardContent, Skeleton, Stack } from "@mui/material";

const EditProductSkeleton: React.FC = () => {
  return (
    <Grid container spacing={2}>
      {/* General Info */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Skeleton width="40%" />
            <Stack spacing={2} mt={1}>
              <Skeleton variant="rectangular" height={56} />
              <Skeleton variant="rectangular" height={56} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Images */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Skeleton variant="rectangular" height={120} />
            <Stack direction="row" spacing={1} mt={1}>
              <Skeleton variant="rectangular" width={80} height={80} />
              <Skeleton variant="rectangular" width={80} height={80} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Pricing */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Skeleton width="30%" />
            <Stack spacing={2} mt={1}>
              <Skeleton variant="rectangular" height={56} />
              <Skeleton variant="rectangular" height={56} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Inventory & Category */}
      <Grid item xs={12} md={6}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Skeleton width="35%" />
              <Stack direction="row" spacing={2} mt={1}>
                <Skeleton variant="rectangular" height={56} width="48%" />
                <Skeleton variant="rectangular" height={56} width="48%" />
              </Stack>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Skeleton width="35%" />
              <Stack spacing={2} mt={1}>
                <Skeleton variant="rectangular" height={56} />
                <Skeleton variant="rectangular" height={56} />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default EditProductSkeleton;